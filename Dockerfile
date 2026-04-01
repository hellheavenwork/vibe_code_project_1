# ── Stage 1: Builder ──────────────────────────────────────────────────────────
# Installs all dependencies and builds the Vite frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Generate Prisma client (needed at build time for type checking)
RUN DATABASE_URL="file:./server/prisma/taskflow.db" \
    npx prisma generate --schema=server/prisma/schema.prisma

# Build the Vite frontend (outputs to /app/dist)
ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build


# ── Stage 2: API (Express + Prisma + SQLite) ──────────────────────────────────
FROM node:20-alpine AS api
WORKDIR /app

# OpenSSL is required by the Prisma query engine on Alpine Linux
RUN apk add --no-cache openssl

# Install all deps (including devDependencies — tsx is needed to run TS directly)
COPY package*.json ./
RUN npm ci

# Copy only server source (no need for src/ frontend code)
COPY server ./server

# Copy the generated Prisma client from builder (includes linux-musl-openssl-3.0.x binary)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create data directory for the SQLite volume mount
RUN mkdir -p /app/data

# Copy and configure the entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
EXPOSE 4000
ENTRYPOINT ["/entrypoint.sh"]


# ── Stage 3: Frontend (nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS frontend

# Copy the built Vite app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (handles SPA routing + /api proxy)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
