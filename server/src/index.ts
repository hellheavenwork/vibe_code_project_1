import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load .env from the project root (where this script is run from)
dotenv.config();

import { authRouter }     from './routes/auth.routes';
import { usersRouter }    from './routes/users.routes';
import { projectsRouter } from './routes/projects.routes';
import { tasksRouter }    from './routes/tasks.routes';
import { columnsRouter }  from './routes/columns.routes';
import { commentsRouter } from './routes/comments.routes';
import { errorHandler }   from './middleware/errorHandler';

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // allow avatars from external sources (dicebear)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https://api.dicebear.com'],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
    },
  },
}));

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // allow cookies to be sent
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body / Cookie parsers ───────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '1mb' }));  // cap body size to prevent payload attacks
app.use(cookieParser());

// ── Health check (public — used by Docker healthcheck) ──────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/users',    usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks',    tasksRouter);
app.use('/api/columns',  columnsRouter);
app.use('/api/tasks',    commentsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
