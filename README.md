# Velnor House

Single-user task management app. Create projects, add tasks with priorities and dates, view them as a list, kanban board, or calendar.

## Tech Stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Shadcn UI |
| Backend  | Node.js, Express, TypeScript, TypeORM, Zod              |
| Database | PostgreSQL                                              |
| State    | TanStack Query (server state), React Router             |
| DnD      | @dnd-kit/react                                          |
| Calendar | FullCalendar                                            |

## Prerequisites

- Node.js 22+
- PostgreSQL 14+ (running locally)
- npm

## Getting Started

```bash
# 1. Clone and install
git clone <repo-url> && cd velnor-house
npm install
npm run install:all

# 2. Create the database
createdb velnor_house_db

# 3. Configure environment
cp apps/backend/.env.example apps/backend/.env
cp apps/client/.env.example apps/client/.env
# Edit apps/backend/.env with your DB credentials if needed

# 4. Start both apps
npm run dev
```

Frontend runs at `http://localhost:5180`, backend at `http://localhost:5000`.

The Vite dev server proxies `/api` requests to the backend, so no CORS issues during development.

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable      | Default                  | Description                        |
|---------------|--------------------------|------------------------------------|
| NODE_ENV      | development              | Environment mode                   |
| PORT          | 3001                     | Server port                        |
| DB_HOST       | localhost                | PostgreSQL host                    |
| DB_PORT       | 5432                     | PostgreSQL port                    |
| DB_NAME       | velnor_house_db          | Database name                      |
| DB_USER       |                          | Database user                      |
| DB_PASSWORD   |                          | Database password                  |
| DB_SYNC       | true                     | TypeORM auto-sync schema (dev only)|
| DB_LOGGING    | false                    | Log SQL queries to console         |
| CORS_ORIGIN   | http://localhost:5180    | Allowed CORS origin                |

### Frontend (`apps/client/.env`)

| Variable           | Default | Description                  |
|--------------------|---------|------------------------------|
| VITE_API_BASE_URL  | /api    | Axios base URL               |
| VITE_PORT          | 5180    | Vite dev server port         |
| VITE_BACKEND_PORT  | 3001    | Backend port (for dev proxy) |

## Project Structure

```
velnor-house/
  package.json                    # Root scripts (concurrently)
  apps/
    backend/
      src/
        index.ts                  # Entry: DB init + server start
        app.ts                    # Express config (cors, json, routes, errors)
        data-source.ts            # TypeORM DataSource config
        entities/                 # TypeORM entities (Project, Task)
        schemas/                  # Zod validation schemas
        middleware/               # Error handler, validation, param parsing
        services/                 # Business logic (DB operations)
        controllers/              # Request handlers
        routes/                   # Route definitions with validation middleware
    client/
      src/
        App.tsx                   # Providers (QueryClient, Router) + routes
        api/                      # Axios client + API functions
        hooks/                    # TanStack Query hooks (useProjects, useTasks)
        types/                    # TypeScript interfaces
        lib/                      # Utilities, constants (status/priority config)
        pages/                    # ProjectsPage, TasksPage
        components/
          layout/                 # AppLayout, Sidebar
          projects/               # ProjectForm (dialog)
          tasks/                  # TaskForm (sheet), TaskCard
          views/                  # ListView, KanbanView, CalendarView, ViewSwitcher
          ui/                     # Shadcn generated components
```

## API Endpoints

### Projects

| Method | Endpoint          | Description                   |
|--------|-------------------|-------------------------------|
| GET    | /api/projects     | List all projects             |
| GET    | /api/projects/:id | Get project with its tasks    |
| POST   | /api/projects     | Create project                |
| PATCH  | /api/projects/:id | Update project                |
| DELETE | /api/projects/:id | Delete project (cascades tasks)|

### Tasks

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | /api/tasks              | List all tasks (optional ?projectId)|
| GET    | /api/tasks/:id          | Get single task                    |
| POST   | /api/tasks              | Create task                        |
| PATCH  | /api/tasks/:id          | Update task                        |
| PATCH  | /api/tasks/:id/reorder  | Move task (status + position)      |
| DELETE | /api/tasks/:id          | Delete task                        |

All endpoints validate input with Zod schemas. Invalid requests return `400` with field-level error details.

## Database Schema

**projects**: id, name, description, color, created_at, updated_at

**tasks**: id, title, description, status (todo/in-progress/done), priority (low/medium/high/urgent), start_date, end_date, position, project_id (FK), created_at, updated_at

TypeORM `synchronize: true` auto-creates/updates tables in development. Disable via `DB_SYNC=false` for production with migrations.

## Architecture Decisions

| Decision              | Choice                | Rationale                                                    |
|-----------------------|-----------------------|--------------------------------------------------------------|
| Monorepo structure    | Two independent apps  | No shared code, independent build/deploy                     |
| State management      | TanStack Query        | Server state caching, optimistic updates, auto-refetch       |
| DnD library           | @dnd-kit/react        | Modern, maintained, accessible (react-beautiful-dnd is EOL)  |
| Form handling         | useState              | 5-6 fields per form; no need for react-hook-form             |
| Input validation      | Zod (middleware)      | Schema-based, type-safe, runs before controllers             |
| Reorder strategy      | Integer position col  | Simple, re-index affected tasks in DB transaction            |
| Dev proxy             | Vite proxy            | /api proxied to backend; no CORS config needed in dev        |

## Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start both apps concurrently         |
| `npm run install:all`| Install deps for backend and client  |

### Backend only (`apps/backend/`)

| Command          | Description              |
|------------------|--------------------------|
| `npm run dev`    | Start with nodemon       |
| `npm run build`  | Compile TypeScript        |
| `npm start`      | Run compiled JS          |

### Client only (`apps/client/`)

| Command          | Description              |
|------------------|--------------------------|
| `npm run dev`    | Start Vite dev server    |
| `npm run build`  | Type-check + build       |
| `npm run preview`| Preview production build |
