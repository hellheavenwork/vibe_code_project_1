# TaskFlow

A full-stack team task management application built with React 19, TypeScript, Express, Prisma, and SQLite.

## Features

- **Kanban board** with drag-and-drop (dnd-kit) and list view toggle
- **Task detail panel** — description, images (localStorage), comments, due date, priority, color label
- **Project management** — create, rename, delete projects from the sidebar
- **User management** — register, CRUD users, role assignment (admin / member)
- **Authentication** — JWT-based login/register, protected routes
- **Landing page** — animated marketing page (Framer Motion)
- **Dark mode** — toggle persisted to localStorage
- **Dashboard** — task stats, upcoming deadlines, recent projects

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Routing | React Router v7 |
| Animation | Framer Motion (`motion/react`) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Backend | Express 4, TypeScript, tsx |
| ORM | Prisma 5 |
| Database | SQLite |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Build | Vite 6 with manual chunk splitting |

## Prerequisites

- Node.js 18+

## Setup

```bash
# Install all dependencies (frontend + backend share one package.json)
npm install

# Create environment file
cp .env.example .env.local   # or create manually

# .env.local must contain:
DATABASE_URL="file:./server/prisma/taskflow.db"
JWT_SECRET=your_jwt_secret_here
PORT=4000
```

## Running Locally

```bash
# Run frontend + backend together (recommended)
npm run dev:all

# Or run separately:
npm run dev          # Frontend on http://localhost:3000
npm run dev:server   # Backend API on http://localhost:4000
```

## Database

```bash
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed with demo data
npm run db:reset     # Reset + re-seed
npm run db:studio    # Open Prisma Studio GUI
```

## Available Scripts

```bash
npm run dev          # Start Vite dev server (port 3000)
npm run dev:server   # Start Express server with hot-reload (port 4000)
npm run dev:all      # Run both concurrently
npm run build        # Production Vite build (chunked output)
npm run preview      # Preview production build
npm run lint         # TypeScript type check (tsc --noEmit)
npm run clean        # Remove dist/
```

## Project Structure

```
├── src/                        # Frontend (React)
│   ├── api/                    # API client functions (fetch wrappers)
│   │   ├── auth.ts
│   │   ├── client.ts           # Base fetch with JWT header injection
│   │   ├── columns.ts
│   │   ├── comments.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   └── users.ts
│   ├── components/
│   │   ├── kanban/             # KanbanBoard → KanbanColumn → KanbanCard (React.memo)
│   │   ├── layout/             # Sidebar (project CRUD, nav, dark mode), Navbar, Layout
│   │   ├── list/               # ListView (list view alternative to Kanban)
│   │   ├── task/               # TaskDetailPanel (images, comments, edit)
│   │   └── ui/                 # Badge, Button, Input, Modal primitives
│   ├── context/
│   │   └── AppContext.tsx      # Global state: currentUser, users, projects, columns
│   ├── data/
│   │   └── mockData.ts         # Static fallback data (used by KanbanCard for avatar lookup)
│   ├── pages/
│   │   ├── Dashboard.tsx       # Stats, upcoming deadlines, recent projects
│   │   ├── LandingPage.tsx     # Animated marketing/home page
│   │   ├── Login.tsx           # JWT login form
│   │   ├── MyTasks.tsx         # All tasks assigned to current user
│   │   ├── ProjectBoard.tsx    # Kanban/List board with filters & search (debounced)
│   │   ├── Register.tsx        # Account registration with password strength meter
│   │   ├── Settings.tsx        # User profile settings
│   │   └── UserManagement.tsx  # Admin CRUD for all users + role assignment
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts            # cn(), formatDate()
│   ├── App.tsx                 # Router + lazy-loaded routes + auth guard
│   └── main.tsx                # React root + AppProvider
│
├── server/                     # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema with indexes
│   │   ├── seed.ts             # Demo data seeder
│   │   └── taskflow.db         # SQLite database file
│   └── src/
│       ├── index.ts            # Express app (compression, routes, error handler)
│       ├── middleware/
│       │   ├── auth.ts         # JWT requireAuth middleware
│       │   └── errorHandler.ts
│       ├── prisma/
│       │   └── client.ts       # Shared Prisma client instance
│       └── routes/
│           ├── auth.routes.ts      # POST /login, POST /register
│           ├── columns.routes.ts   # GET /columns
│           ├── comments.routes.ts  # GET/POST /tasks/:id/comments
│           ├── projects.routes.ts  # CRUD /projects (+ member management)
│           ├── tasks.routes.ts     # CRUD /tasks (+ tag management)
│           └── users.routes.ts     # CRUD /users (+ role update)
│
├── vite.config.ts              # Vite + Tailwind + proxy + manual build chunks
├── CLAUDE.md                   # Claude Code workspace instructions
└── package.json                # Shared deps for frontend + backend
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/users` | List all users |
| PATCH | `/api/users/:id` | Update user (name, role) |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PATCH | `/api/projects/:id` | Update project (name, color, members) |
| DELETE | `/api/projects/:id` | Delete project (owner only) |
| GET | `/api/projects/:id/tasks` | Get tasks for a project |
| GET | `/api/tasks` | All tasks across user's projects |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task (atomic tag replacement) |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/:id/comments` | Get task comments |
| POST | `/api/tasks/:id/comments` | Add comment |
| GET | `/api/columns` | Get all Kanban columns |

## Performance Optimizations

- **Gzip compression** on all API responses (`compression` middleware)
- **Database indexes** on `Task(projectId, columnId, assigneeId)` and `Comment(taskId)`
- **Atomic DB transactions** for tag updates and member replacements
- **Optimized Prisma selects** — auth checks use `select` instead of full `include`
- **React.memo** on `KanbanCard` to prevent unnecessary re-renders
- **Module-level constants** for priority/color maps (not recreated on every render)
- **Debounced search** (250ms) in ProjectBoard to reduce `useMemo` recalculations
- **Lazy route loading** with `React.lazy` + `Suspense` for all heavy pages
- **Vite manual chunks** — `vendor-react`, `vendor-ui`, `vendor-dnd` for better browser caching

## Authentication

JWT token is stored in `localStorage` under `authToken`. The `isAuthenticated` flag is also stored in `localStorage`. All protected API calls include `Authorization: Bearer <token>` via `src/api/client.ts`.

## Image Storage

Task images are stored as base64 data URIs in `localStorage` with the key `taskflow_images_<taskId>`. Note: localStorage has a ~5MB limit per origin.

## Dark Mode

Theme is toggled via a custom DOM event `theme-updated` and persisted to `localStorage` under the key `theme` (`'dark'` | `'light'`). The `dark` class is applied to `document.documentElement`.
