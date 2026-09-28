# The Red Popcorn Wagon

Website + admin panel for a popcorn cart event business in metro Atlanta. Admins edit site
content and packages; customers book a cart for their event.

## Stack

| Layer    | Tech                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| Backend  | FastAPI, SQLAlchemy 2, Alembic, Pydantic Settings; modular monolith (`backend/`)  |
| Database | Supabase Postgres, via `psycopg` 3                                                 |
| Auth     | Supabase Auth (admin sign-in); API verifies Supabase tokens + `admin_users` list   |
| Frontend | Vite, React, TypeScript, TanStack Query, Tailwind CSS v4; Feature-Sliced Design (`frontend/`) |

Coding rules and architecture: see [`AGENTS.md`](AGENTS.md).

## Prerequisites

- [uv](https://docs.astral.sh/uv/) (installs Python 3.12 for you)
- Node.js 20+

## Setup

### 1. Supabase

1. Create a project at <https://supabase.com>.
2. `backend/.env` (copy `backend/.env.example`):
   - `DATABASE_URL`: **Connect** → **Session pooler** connection string.
   - `SUPABASE_URL`: **Project Settings → Data API** (`https://<ref>.supabase.co`).
   - `SUPABASE_SECRET_KEY`: **Project Settings → API Keys → Secret key** (`sb_secret_...`). Server only.
3. `frontend/.env.local` (copy `frontend/.env.example`):
   - `VITE_SUPABASE_URL`: same project URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: **Project Settings → API Keys** (`sb_publishable_...`).
4. In the Supabase dashboard:
   - **Project Settings → JWT Keys**: use JWT signing keys (not the legacy JWT secret).
   - **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
   - **Authentication → URL Configuration**: add `http://localhost:5173/admin/reset-password`
     as a redirect URL (password-reset emails).

### 2. Backend

**No Supabase database yet?** Run on a local embedded Postgres (data kept in `backend/.devdb`):

```sh
cd backend
uv sync
uv run python scripts/dev_local.py       # migrates, seeds sample packages, serves :8000
```

**With Supabase** (`DATABASE_URL` set in `backend/.env`):

```sh
cd backend
uv sync
uv run alembic upgrade head              # apply migrations
uv run python -m app.cli seed-packages   # optional: add the 3 sample packages
uv run python -m app.cli seed-content    # default site settings, theme and sections
uv run python -m app.cli setup-storage   # create the public image bucket (uploads)
uv run uvicorn app.main:app --reload     # http://localhost:8000
```

- API docs: <http://localhost:8000/docs>
- Health: `GET /api/v1/health`, DB check: `GET /api/v1/health/db`

### Admin account

Needs `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Creates the Supabase Auth user and adds them
to `admin_users` as owner (you'll be asked for a password, 10+ characters):

```sh
cd backend
uv run python -m app.cli create-owner --email you@example.com --name "Your Name"            # Supabase DB
uv run python scripts/dev_local.py create-owner --email you@example.com --name "Your Name"   # local DB
```

Then sign in at <http://localhost:5173/admin>.

### 3. Frontend

```sh
cd frontend
npm install
npm run dev                              # http://localhost:5173
```

In dev, Vite proxies `/api` to `http://localhost:8000`.

## Deploy

The API runs on [Render](https://render.com) (`render.yaml`) and the frontend on
[Vercel](https://vercel.com) (`frontend/vercel.json`). Both deploy from `staging` on every push.
The API uses the same Supabase project as local dev unless you point it at another one.

### 1. API on Render

1. Push this repo to GitHub.
2. Render → **New → Blueprint** → pick the repo. It reads `render.yaml` and asks for:
   - `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`: same as `backend/.env`.
   - `FRONTEND_URL`: leave blank for now (filled in step 3).
   - `RESEND_API_KEY`: your Resend key, or blank to skip emails.
   - `EMAIL_TEST_RECIPIENT`: your own address until the email domain is verified (below).
3. Wait for the deploy, then open `https://<service>.onrender.com/api/v1/health/db`; it should
   say `"database":"connected"`. Migrations run on every start.

The free plan sleeps after 15 minutes without traffic; the next visit takes about a minute.

### 2. Frontend on Vercel

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory**: `frontend`. The rest (Vite, `npm run build`, `dist`) comes from `vercel.json`.
3. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://<service>.onrender.com/api/v1`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`: same as `frontend/.env.local`.
4. Deploy. In **Settings → Git**, set the production branch to `staging`.

### 3. Connect them

1. Render → the service → **Environment**:
   - `CORS_ORIGINS`: `https://<project>.vercel.app` (add your own domain too if you set one up,
     separated by a comma). Vercel's per-commit preview URLs aren't listed, so they can't reach
     the API.
   - `FRONTEND_URL`: `https://<project>.vercel.app`
2. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://<project>.vercel.app`
   - Redirect URLs: add `https://<project>.vercel.app/admin/reset-password`
3. Sign in at `https://<project>.vercel.app/admin`.

### Emails

Resend's default sender only delivers to your own Resend account. To email customers, verify
your domain in Resend, add `EMAIL_FROM` (e.g. `The Red Popcorn Wagon <bookings@yourdomain.com>`)
on Render, and remove `EMAIL_TEST_RECIPIENT`.

## Common commands

```sh
# backend/
uv run pytest                                     # tests (embedded Postgres, never Supabase)
uv run ruff check . && uv run ruff format .       # lint + format
uv run alembic revision --autogenerate -m "msg"   # new migration after model changes

# frontend/
npm run build
npm run lint
```

## Project layout

```
backend/app/
  main.py, api_router.py, cli.py
  core/                  # config, errors, clock, shared constants + dependencies
  db/                    # Base, session, registry (all models, for Alembic)
  modules/<feature>/     # packages, bookings, auth, health; each with its own
                         # models, schemas, service, router (+ constants, enums, commands)
backend/tests/modules/<feature>/

frontend/src/            # Feature-Sliced Design
  app/ pages/ widgets/ features/ entities/ shared/
```
