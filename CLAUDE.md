# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # Install all dependencies (frontend + backend share one package.json)
npm run dev           # Start Vite dev server on port 3000
npm run dev:server    # Start Express API server on port 4000 (tsx watch)
npm run dev:all       # Run both frontend and backend concurrently
npm run build         # Production build (Vite, with manual chunk splitting)
npm run preview       # Preview production build
npm run lint          # TypeScript type check (tsc --noEmit)
npm run clean         # Remove dist/

# Database
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed with demo data
npm run db:reset      # Reset DB and re-seed
npm run db:studio     # Open Prisma Studio
```

No test framework is configured. `npm run lint` is the primary code validation step.

## Environment

Requires a `.env` or `.env.local` file with:
```
DATABASE_URL="file:./server/prisma/taskflow.db"
JWT_SECRET=your_jwt_secret_here
PORT=4000
GEMINI_API_KEY=your_key_here   # optional, for AI features
```

HMR is disabled when `DISABLE_HMR=true` (set automatically by Google AI Studio).

## Architecture

**TaskFlow** is a full-stack team task management app:
- **Frontend**: React 19 + TypeScript SPA, built with Vite 6 and Tailwind CSS 4
- **Backend**: Express 4 + Prisma 5 + SQLite, running via `tsx` (same package.json)

### Key Files

| File | Purpose |
|---|---|
| `src/main.tsx` | React root, wraps app in `AppProvider` |
| `src/App.tsx` | React Router setup, auth guard (`ProtectedRoute`), lazy-loaded pages, `ThemeManager` |
| `src/context/AppContext.tsx` | Global state: `currentUser`, `users`, `projects`, `columns`; exposes `refreshProjects`, `refreshUsers` |
| `src/data/mockData.ts` | Static user data used by `KanbanCard` for avatar lookup (legacy fallback) |
| `src/types/index.ts` | Shared TypeScript interfaces: `User`, `Project`, `Task`, `Column`, `Comment` |
| `src/api/client.ts` | Base fetch wrapper — injects `Authorization: Bearer <token>` header |
| `server/src/index.ts` | Express app entry — `compression()`, JSON body parser, routes, error handler |
| `server/prisma/schema.prisma` | Prisma schema with indexes on Task and Comment |

### Routing & Layout

- `/` → `LandingPage` (lazy)
- `/login` → `Login` (eager, small)
- `/register` → `Register` (eager, small)
- `/app/*` → Protected by `ProtectedRoute` → renders `Layout` (Sidebar + Navbar + Outlet)
  - `/app` → `Dashboard` (lazy)
  - `/app/project/:id` → `ProjectBoard` (lazy)
  - `/app/tasks` → `MyTasks` (lazy)
  - `/app/users` → `UserManagement` (lazy)
  - `/app/settings` → `Settings` (lazy)

### Auth

- JWT is set as an **httpOnly cookie** (`authToken`) by the server on login/register — JS cannot read it (XSS-safe)
- `localStorage.isAuthenticated === 'true'` is used only as a client-side route guard hint (not trusted for security)
- `requireAuth` middleware reads from cookie first, falls back to `Authorization: Bearer` header for non-browser clients
- New users default to `role: 'member'`; promote to `admin` manually via User Management
- Roles: `admin` can PATCH/DELETE any user; `member` can only edit their own profile via `/me`

### Dark Mode

- Toggled via `window.dispatchEvent(new CustomEvent('theme-updated', { detail: { isDarkMode } }))`
- `ThemeManager` in `App.tsx` listens and applies/removes `dark` class on `document.documentElement`
- Persisted in `localStorage.theme` (`'dark'` | `'light'`)

### Modals & Stacking Context

The `Layout.tsx` sidebar wrapper uses `transform` CSS, which creates a new stacking context and traps `position: fixed` children. **All modals must use `createPortal(…, document.body)`** to escape this and appear centered on screen. This applies to modals in `Sidebar.tsx` and `Dashboard.tsx`.

### Kanban & Drag-and-Drop

`src/components/kanban/` uses `@dnd-kit/core` and `@dnd-kit/sortable`.
Component hierarchy: `KanbanBoard` → `KanbanColumn` → `KanbanCard`

`KanbanCard` is wrapped in `React.memo`. The `priorityColors` and `colorClasses` maps are defined at **module level** (not inside the component) to preserve memo effectiveness.

### Task Images

Images are stored as base64 data URIs in `localStorage` with key `taskflow_images_<taskId>`. This uses the browser's ~5MB storage limit.

### API Layer

All API calls go through `src/api/client.ts`. Vite proxies `/api/*` to `http://localhost:4000` in dev. Routes are in `server/src/routes/`.

The frontend calls the API directly — no React Query or SWR is used. `AppContext` fetches all shared data (users, projects, columns) on mount via `Promise.all`.

### Database

Prisma schema: `User`, `Project`, `ProjectMember`, `Column`, `Task`, `TaskTag`, `Comment`

Indexes:
- `Task`: `@@index([projectId])`, `@@index([columnId])`, `@@index([assigneeId])`
- `Comment`: `@@index([taskId])`

After schema changes, run: `DATABASE_URL="file:./server/prisma/taskflow.db" npx prisma db push --schema=server/prisma/schema.prisma`

### Security Notes

- **Helmet** sets security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **CORS** is restricted to `ALLOWED_ORIGINS` env var (default: localhost:3000 and 3001)
- **Rate limiting**: login endpoint — 10 failed attempts per 15 min per IP; register — 5 per hour
- **httpOnly cookies**: JWT never accessible from JavaScript; sent automatically with `credentials: 'include'`
- **bcrypt rounds**: 12 (OWASP recommended) for all password hashing
- **Admin-only routes**: `PATCH /api/users/:id` and `DELETE /api/users/:id` require `role === 'admin'`
- **Project membership checks**: all task/comment read+write endpoints verify the user is a project member
- **Tag sanitization**: tags are validated as strings, trimmed, max 50 chars each, max 20 per task
- **Comment length cap**: comments limited to 2000 characters
- **Body size limit**: `express.json({ limit: '1mb' })` prevents large payload attacks
- **Timing attack prevention**: login always runs bcrypt even when username is not found
- **Username validation**: regex `^[a-z0-9_]{3,30}$` enforced on registration
- **Default role**: new users get `role: 'member'` (least privilege)
- **JWT expiry**: 24 hours (configurable via `JWT_EXPIRES_IN` env var)

### Performance Notes

- `compression()` middleware gzips all API responses
- Task PATCH uses `$transaction` for atomic tag replacement
- Project member update uses `$transaction`
- Prisma auth checks use `select` (not `include`) to avoid loading full member objects
- Search in `ProjectBoard` is debounced 250ms before updating `filteredTasks` useMemo
- Routes are lazy-loaded with `React.lazy` + `Suspense`
- Vite build uses `manualChunks`: `vendor-react`, `vendor-ui`, `vendor-dnd`

### Path Alias

`@/` maps to the project root (configured in both `tsconfig.json` and `vite.config.ts`).
