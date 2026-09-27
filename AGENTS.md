# AGENTS.md

Rules for AI coding agents (and humans) working in this repo. Follow them for every change.
If a rule blocks you, stop and ask; don't silently work around it.

## Project

Popcorn cart event-booking website with a CMS admin panel.

- `backend/`: FastAPI, SQLAlchemy 2 (typed ORM), Alembic, Pydantic v2, Supabase Postgres
- `frontend/`: Vite, React, TypeScript, TanStack Query, Tailwind CSS v4

See `README.md` for setup and commands.

## Definition of done

A change is done only when all of these pass:

```sh
# backend/
uv run ruff check . && uv run ruff format --check . && uv run pytest

# frontend/
npm run lint && npm run build
```

Never report something as working without running these. Add or update tests for any behavior change.

The linters enforce part of this file. **Don't disable a rule** (`# noqa`, `oxlint-disable`,
editing the config) to make a check pass; fix the code. If a suppression is truly needed,
scope it to one line and add a comment saying why.

- Ruff: magic values (`PLR2004`), type annotations (`ANN`), naming, commented-out code, `print`.
- oxlint: `no-magic-numbers`, `no-explicit-any`, `no-non-null-assertion`, `exhaustive-deps`, `eqeqeq`.
- TypeScript: `strict` + `noUncheckedIndexedAccess`.

## General principles

- **Small, focused units.** One reason to change per function, component or module.
  A function over ~40 lines or a file over ~300 lines means you should split it.
- **Follow existing patterns** before inventing new ones. Search the codebase first.
- **No dead code.** Don't leave commented-out code, unused imports or speculative helpers.
  Build what the task needs (YAGNI).
- **Descriptive names.** `booking_date`, not `d`; `isSubmitting`, not `flag`.
  Booleans read as questions (`is_`, `has_`, `can_`).
- **Early returns** over nested `if`/`else`.
- **Comments explain *why*,** not *what*. Delete comments that restate the code.
- **No secrets in code.** Configuration comes from env vars through `app/core/config.py`
  (backend) or `import.meta.env.VITE_*` (frontend). Update the `.env.example` files when you add one.

## No magic strings or numbers

Any literal with domain meaning must be a named constant or enum, defined **once**.

- **Statuses, roles, types** (booking status, payment status, content block type) are enums.
  - Backend: `class BookingStatus(StrEnum)`, stored with SQLAlchemy `Enum(...)`.
  - Frontend: mirror them as `as const` objects plus a derived union type. Never compare
    against raw strings like `status === "approved"`.
- **Limits and business values** (max guests, page size, deposit percent, lead-time days)
  are module-level `UPPER_SNAKE_CASE` constants, or settings if they differ per environment.
- **Query keys** live in one query-key factory per feature (see Frontend).
- **API paths** are defined once per feature, not scattered through components.
- **Allowed literals:** `0`, `1`, `-1`, `""`, `True`/`False`, and values that are
  self-explanatory in context (e.g. `len(items) == 0`).

```python
# Bad
if booking.status == "approved" and guests > 300: ...

# Good
if booking.status is BookingStatus.APPROVED and guests > MAX_GUESTS_PER_EVENT: ...
```

## Backend (FastAPI + SQLAlchemy 2)

### Layering

Keep the flow one-directional: **router → service → repository/ORM**.

```
app/api/v1/endpoints/<resource>.py   # HTTP only: parse input, call service, return schema
app/services/<resource>.py           # business rules, transactions
app/models/<resource>.py             # SQLAlchemy models
app/schemas/<resource>.py            # Pydantic request/response models
app/core/                            # config, security, shared constants/enums
```

- **Endpoints stay thin.** No business logic and no raw queries in route functions.
- **Services** take a `Session` and plain arguments, return models or domain values,
  and don't know about HTTP. Raise domain exceptions and map them to `HTTPException` in one place.
- **Each resource gets its own `APIRouter`,** included in `app/api/v1/router.py`.
  Every route declares `response_model` (or a return type) and `status_code` where it isn't 200.
- **Use FastAPI dependencies** (`Annotated[..., Depends(...)]`, e.g. `SessionDep`) for the
  DB session, the current user and pagination. Don't create sessions by hand in endpoints.

### SQLAlchemy 2 style

- Use only the typed 2.0 API: `Mapped[...]`, `mapped_column()`, `select()`,
  `db.scalars()` and `db.execute()`. Never use the legacy `db.query(...)`.
- Every model inherits `Base` (plus `TimestampMixin` when it needs timestamps) and is
  imported in `app/models/__init__.py` so Alembic sees it.
- Money is stored as `Numeric(12, 2)` (or integer centavos), never `float`.
  Datetimes are timezone-aware (`DateTime(timezone=True)`).
- Add indexes for columns you filter or sort by (status, event date, foreign keys).
- **Every schema change ships with an Alembic migration**
  (`uv run alembic revision --autogenerate -m "..."`). Review the generated file before
  committing, and never edit a migration that has already been applied.

### No N+1 queries

- **Declare every relationship with `lazy="raise"`.** Accidental lazy loads then fail
  loudly instead of silently firing one query per row.
- **Load related data on purpose,** in the query that needs it:
  - `selectinload(...)` for one-to-many and many-to-many collections.
  - `joinedload(...)` for many-to-one or one-to-one.
- **Never query inside a loop.** Batch with `where(Model.id.in_(ids))` or a join.
- **Every list endpoint is paginated** (`limit`/`offset` or a cursor) with a max page-size
  constant. Use `func.count()` for counts; don't `len()` a loaded list.
- **Aggregate in SQL** (`func.count`, `func.sum`, `group_by`), not in Python loops.
- When you add a list endpoint, add a test that asserts its query count stays constant as
  the number of rows grows.

### Validation & errors

- Validate all input with Pydantic schemas (`Field(min_length=..., gt=...)`, enums).
  Keep request and response schemas separate (`BookingCreate`, `BookingRead`), and don't
  return ORM objects that aren't declared in a schema.
- Response schemas use `model_config = ConfigDict(from_attributes=True)`.
- Return proper status codes: 201 for created, 204 for no content, 404, 409 for conflicts,
  422 for validation errors. Error bodies use FastAPI's standard `{"detail": ...}`.

### Testing

- Use `pytest` with FastAPI's `TestClient`. Test services directly for business rules and
  test endpoints for HTTP contracts.
- Tests must not touch the Supabase database. Use a separate test database or fixtures,
  configured through settings.

## Frontend (React + TanStack Query + Tailwind)

### Structure

```
src/lib/                      # api client, queryClient, shared utils
src/components/ui/            # reusable, presentational components (no data fetching)
src/features/<feature>/
  api.ts                      # typed fetch functions for this feature
  queryKeys.ts                # query-key factory
  hooks.ts                    # useQuery / useMutation hooks
  components/                 # feature components
  types.ts                    # types + `as const` enums mirroring the backend
```

### TypeScript

- Keep `strict` mode on. **No `any`.** Use `unknown` and narrow it. No non-null `!` except
  at the root mount.
- Type every API response. Keep the types in step with the backend Pydantic schemas.
- Use `import type` for type-only imports.

### Data fetching (TanStack Query)

- **Every server read goes through `useQuery`,** wrapped in a feature hook (`useBookings()`).
  Components never call `fetch` or `apiFetch` directly.
- **Query keys come from a factory:**
  ```ts
  export const bookingKeys = {
    all: ['bookings'] as const,
    list: (filters: BookingFilters) => [...bookingKeys.all, 'list', filters] as const,
    detail: (id: number) => [...bookingKeys.all, 'detail', id] as const,
  }
  ```
- **Writes use `useMutation`,** then `invalidateQueries` with the factory key on success.
- **No request waterfalls.** Don't fetch per item in a list (that's the frontend N+1).
  Ask the backend for an endpoint that returns what the screen needs.
- **Handle all three states:** loading, error and empty.

### Components & styling

- Function components only. Keep them small; move logic into hooks.
- Props are typed with a `type Props = {...}`. No prop drilling deeper than 2 levels;
  lift state into a hook or context instead.
- **Style with Tailwind utility classes only.** No inline `style={}`, no new CSS files.
  Put design tokens (brand colors, fonts) in `@theme` in `src/index.css` and use them;
  don't hard-code hex values in components.
- **Accessibility:** use semantic HTML, give every input a label, use buttons for actions
  and links for navigation, and add `alt` text to images.

## Git

- Branch off `staging`. Write small, focused commits with imperative messages
  ("Add booking status enum").
- Never commit `.env` files, `node_modules`, `.venv` or build output.
- **No AI attribution** in commits or PRs: no `Co-Authored-By: Claude ...` trailers and no
  "Generated with Claude Code" lines.
