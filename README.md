# Popcorn Cart CMS

Website + admin panel for a popcorn cart event business. Admins edit site content
and packages; customers book a cart for their event.

## Stack

| Layer    | Tech                                                        |
| -------- | ----------------------------------------------------------- |
| Backend  | FastAPI, SQLAlchemy 2, Alembic, Pydantic Settings (`backend/`) |
| Database | Supabase Postgres (free tier), via `psycopg` 3              |
| Frontend | Vite, React, TypeScript, TanStack Query, Tailwind CSS v4 (`frontend/`) |

## Prerequisites

- [uv](https://docs.astral.sh/uv/) (installs Python 3.12 for you)
- Node.js 20+

## Setup

### 1. Database (Supabase)

1. Create a free project at <https://supabase.com>.
2. **Project Settings → Database → Connection string**, pick **Session pooler** (port 5432).
3. Put it in `backend/.env` as `DATABASE_URL` (see `backend/.env.example`).

### 2. Backend

```sh
cd backend
uv sync
uv run alembic upgrade head              # apply migrations
uv run uvicorn app.main:app --reload     # http://localhost:8000
```

- API docs: <http://localhost:8000/docs>
- Health: `GET /api/v1/health`, DB check: `GET /api/v1/health/db`

### 3. Frontend

```sh
cd frontend
npm install
npm run dev                              # http://localhost:5173
```

In dev, Vite proxies `/api` to `http://localhost:8000`.

## Common commands

```sh
# backend/
uv run pytest                                     # tests
uv run ruff check . && uv run ruff format .       # lint + format
uv run alembic revision --autogenerate -m "msg"   # new migration after model changes

# frontend/
npm run build
npm run lint
```

## Project layout

```
backend/
  app/
    main.py              # FastAPI app factory, CORS, router mount
    core/config.py       # settings from .env
    db/base.py           # DeclarativeBase + TimestampMixin
    db/session.py        # engine, SessionLocal, get_db
    models/              # SQLAlchemy models (import them in models/__init__.py)
    schemas/             # Pydantic request/response models
    api/deps.py          # shared dependencies (SessionDep)
    api/v1/router.py     # v1 APIRouter; include endpoint routers here
    api/v1/endpoints/    # one module per resource
  alembic/               # migrations
  tests/
frontend/
  src/
    lib/api.ts           # fetch wrapper
    lib/queryClient.ts   # TanStack Query client
    features/<name>/     # hooks + components per feature
```
