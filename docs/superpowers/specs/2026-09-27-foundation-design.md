# Foundation design: popcorn cart CMS + booking

- **Date:** 2026-09-27
- **Status:** Draft, awaiting review
- **Coding rules:** `AGENTS.md`

## 1. Goal

A popcorn cart event business (in the style of "Red Wagon popcorn") needs a public website and an
admin panel.

- **Admins** (owner + staff) edit the site content and the cart packages, and manage bookings,
  without touching code.
- **Customers** browse packages and send a booking request for their event. They don't need an
  account.

Success for this phase: the owner can put the site together from the admin panel, a customer can
submit a booking, and the owner can review it and move it through its statuses.

### Decided

| Topic            | Decision                                                                   |
| ---------------- | -------------------------------------------------------------------------- |
| Booked product   | Popcorn cart for an event, chosen as a package                             |
| Capacity per day | Unlimited. Any date can be requested; the admin approves or declines each  |
| Customer account | None. Guest booking form; the admin contacts them by phone or email        |
| Payment          | Out of scope for this phase                                                |

### Out of scope (later phases)

Payments or proof-of-payment, email/SMS notifications, calendar view, customer accounts,
availability limits, multi-language, analytics.

## 2. Architecture

```
Browser ──► Vite/React SPA ──/api/v1──► FastAPI ──SQLAlchemy 2──► Supabase Postgres
                                           └────── httpx ───────► Supabase Storage (images)
```

- **One SPA** serves both the public site (`/`) and the admin panel (`/admin/*`), with routing
  by **React Router v7** (library mode).
- **The backend is the only thing that talks to Supabase.** The frontend never gets Supabase keys.
- **Backend layers:** endpoint → service → ORM, as set out in `AGENTS.md`.

### New dependencies

| Where    | Package                   | Why                                        |
| -------- | ------------------------- | ------------------------------------------ |
| backend  | `pyjwt`                   | admin access tokens                        |
| backend  | `pwdlib[argon2]`          | password hashing                           |
| backend  | `python-multipart`        | image upload form data                     |
| backend  | `httpx`                   | Supabase Storage REST calls                |
| frontend | `react-router`            | routing                                    |
| frontend | `react-hook-form` + `zod` | forms + validation (booking, admin forms)  |

## 3. Data model

All tables use `Base` + `TimestampMixin` (`created_at`, `updated_at`), an integer `id` primary
key, and the enums below stored as Postgres enums.

### Enums (`app/core/enums.py`, mirrored in `frontend/src/features/*/types.ts`)

- `AdminRole`: `owner`, `staff`
- `BookingStatus`: `pending`, `approved`, `declined`, `completed`, `cancelled`
- `SectionType`: `hero`, `text`, `image_text`, `gallery`, `faq`, `cta`

### `admin_users`

| column          | type           | notes                    |
| --------------- | -------------- | ------------------------ |
| `email`         | `String(255)`  | unique, stored lowercase |
| `password_hash` | `String(255)`  | argon2                   |
| `full_name`     | `String(120)`  |                          |
| `role`          | `AdminRole`    |                          |
| `is_active`     | `Boolean`      | default true             |

### `site_settings` (single row, `id = 1`)

`business_name`, `tagline`, `logo_url`, `contact_email`, `contact_phone`, `address`,
`facebook_url`, `instagram_url`, `tiktok_url`. All are optional except `business_name`.

### `pages`

| column         | type          | notes                                       |
| -------------- | ------------- | ------------------------------------------- |
| `slug`         | `String(80)`  | unique, e.g. `home`, `about`                |
| `title`        | `String(160)` | also used as the `<title>`                  |
| `is_published` | `Boolean`     | unpublished pages return 404 publicly       |

A `home` page is seeded by migration and can't be deleted.

### `page_sections`

| column       | type                 | notes                                        |
| ------------ | -------------------- | -------------------------------------------- |
| `page_id`    | FK → `pages`         | cascade delete, indexed                      |
| `type`       | `SectionType`        |                                              |
| `position`   | `Integer`            | display order within a page                  |
| `is_visible` | `Boolean`            | hidden sections aren't served publicly       |
| `content`    | `JSONB`              | shape depends on `type` (below)              |

`content` is validated by a **Pydantic discriminated union** keyed on `type`, so each section type
has a strict schema:

| type         | content fields                                                            |
| ------------ | ------------------------------------------------------------------------- |
| `hero`       | `heading`, `subheading?`, `image_url?`, `cta_label?`, `cta_href?`         |
| `text`       | `heading?`, `body` (plain text with line breaks)                          |
| `image_text` | `heading`, `body`, `image_url`, `image_side` (`left` / `right`)           |
| `gallery`    | `heading?`, `images[]` (`url`, `alt`)                                     |
| `faq`        | `heading?`, `items[]` (`question`, `answer`)                              |
| `cta`        | `heading`, `body?`, `button_label`, `button_href`                         |

The body is **plain text, not HTML**, so there's no XSS surface. Rich text can come in a later phase.

### `packages`

| column           | type             | notes                             |
| ---------------- | ---------------- | --------------------------------- |
| `name`           | `String(120)`    |                                   |
| `slug`           | `String(140)`    | unique, generated from name       |
| `description`    | `Text`           |                                   |
| `price`          | `Numeric(12, 2)` | USD                               |
| `servings`       | `Integer`        | > 0                               |
| `duration_hours` | `Integer`        | > 0                               |
| `image_url`      | `String(500)?`   |                                   |
| `is_active`      | `Boolean`        | inactive packages hidden publicly |
| `position`       | `Integer`        | display order                     |

### `bookings`

| column               | type                 | notes                                        |
| -------------------- | -------------------- | -------------------------------------------- |
| `reference`          | `String(12)`         | unique, e.g. `PC-7K3M9Q`, shown to customer  |
| `package_id`         | FK → `packages`      | restrict delete, indexed                     |
| `package_name`       | `String(120)`        | snapshot at booking time                     |
| `package_price`      | `Numeric(12, 2)`     | snapshot at booking time                     |
| `event_date`         | `Date`               | indexed                                      |
| `event_start_time`   | `Time`               |                                              |
| `venue_address`      | `String(500)`        |                                              |
| `guest_count`        | `Integer`            | 1 to `MAX_GUEST_COUNT`                       |
| `customer_name`      | `String(120)`        |                                              |
| `customer_phone`     | `String(30)`         |                                              |
| `customer_email`     | `String(255)`        |                                              |
| `customer_notes`     | `Text?`              |                                              |
| `status`             | `BookingStatus`      | default `pending`, indexed                   |
| `admin_notes`        | `Text?`              | never exposed publicly                       |
| `status_changed_at`  | `DateTime(tz)`       |                                              |

Package name and price are **snapshotted** so later price edits don't rewrite past bookings.

## 4. Business rules

- **Booking lead time:** `event_date` must be at least `MIN_BOOKING_LEAD_DAYS` (constant, 1)
  after today, and at most `MAX_BOOKING_ADVANCE_DAYS` (constant, 365) ahead. "Today" is
  computed in `BUSINESS_TIMEZONE` (setting, `America/New_York`, since the business is in Atlanta, GA).
- **Only active packages** can be booked.
- **Allowed status transitions,** defined once as a mapping in the booking service:

  ```
  pending  → approved | declined | cancelled
  approved → completed | cancelled
  declined, completed, cancelled → (final)
  ```

  Any other transition returns **409 Conflict**.
- **Spam protection:** the public booking form has a hidden honeypot field. A filled honeypot
  gets a fake 201 response and nothing is stored.
- **Admin roles:** `owner` can manage admin users. `staff` can do everything else.
- **Deleting a package** that has bookings is blocked (409). Deactivate it instead.

## 5. API (`/api/v1`)

### Public (no auth)

| Method | Path                         | Returns                                           |
| ------ | ---------------------------- | ------------------------------------------------- |
| GET    | `/site-settings`             | site settings                                     |
| GET    | `/pages/{slug}`              | published page + visible sections, in one query   |
| GET    | `/packages`                  | active packages, ordered by `position`            |
| GET    | `/packages/{slug}`           | one active package                                |
| POST   | `/bookings`                  | 201 with `reference` and a summary                |

### Admin (Bearer token)

| Method              | Path                                          | Purpose                                |
| ------------------- | --------------------------------------------- | -------------------------------------- |
| POST                | `/admin/auth/login`                           | email + password → access token        |
| GET                 | `/admin/auth/me`                              | current admin                          |
| GET, PUT            | `/admin/site-settings`                        | read / update                          |
| GET, POST           | `/admin/pages`                                | list / create                          |
| GET, PATCH, DELETE  | `/admin/pages/{id}`                           | incl. all sections                     |
| POST                | `/admin/pages/{id}/sections`                  | add section                            |
| PATCH, DELETE       | `/admin/sections/{id}`                        | edit / remove section                  |
| PUT                 | `/admin/pages/{id}/sections/order`            | reorder: list of section ids           |
| GET, POST           | `/admin/packages`                             | list (incl. inactive) / create         |
| PATCH, DELETE       | `/admin/packages/{id}`                        |                                        |
| GET                 | `/admin/bookings`                             | paginated, filter by status/date range, search by reference or name |
| GET, PATCH          | `/admin/bookings/{id}`                        | detail; edit `admin_notes`             |
| POST                | `/admin/bookings/{id}/status`                 | change status (validated transitions)  |
| POST                | `/admin/uploads/images`                       | upload → public URL                    |
| GET, POST           | `/admin/users`                                | owner only                             |
| PATCH               | `/admin/users/{id}`                           | owner only (role, active, password)    |

- **Pagination:** `limit` (default `DEFAULT_PAGE_SIZE` = 20, max `MAX_PAGE_SIZE` = 100) and
  `offset`. Responses look like `{ items, total, limit, offset }`.
- **Errors:** FastAPI's standard `{"detail": ...}`, using 401, 403, 404, 409 and 422.

## 6. Auth

- **Passwords** are hashed with argon2 (`pwdlib`).
- **Login** returns a short-lived **JWT access token** (HS256), valid for
  `ACCESS_TOKEN_EXPIRE_MINUTES` (setting, 720). The claims are `sub` (admin id) and `role`.
  The signing key is the `JWT_SECRET` setting.
- **Protected routes** use the `CurrentAdminDep` dependency, which loads the admin and rejects
  inactive ones. `OwnerDep` adds the role check.
- **The frontend** stores the token in `localStorage` and sends it as `Authorization: Bearer`.
  A 401 response clears the token and redirects to `/admin/login`.
  - *Trade-off:* an httpOnly cookie would be safer against XSS but needs CSRF handling and
    cross-domain cookie setup at deploy time. Plain-text content (no HTML rendering) keeps the
    XSS risk low for now.
- **First owner:** created with `uv run python -m app.cli create-owner --email ... --name ...`,
  which prompts for the password.

## 7. Image uploads

- The backend receives the upload as multipart and checks it:
  - Type: one of `ALLOWED_IMAGE_TYPES` (`image/jpeg`, `image/png`, `image/webp`), checked by
    sniffing the file's magic bytes, not just the header.
  - Size: no more than `MAX_IMAGE_BYTES` (5 MB).
- It uploads the file to a **public Supabase Storage bucket** (`STORAGE_BUCKET` setting) under
  `images/{uuid}.{ext}`, using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (backend only),
  and returns the public URL.
- A `StorageClient` interface wraps this so tests can use a fake.

## 8. Frontend

### Routes

| Path                          | Screen                                              |
| ----------------------------- | --------------------------------------------------- |
| `/`                           | home page rendered from `home` sections             |
| `/p/:slug`                    | any other published page                            |
| `/packages`                   | package cards                                       |
| `/book`                       | booking form (`?package=slug` preselects)           |
| `/book/success/:reference`    | confirmation with reference number                  |
| `/admin/login`                | login                                               |
| `/admin`                      | bookings list (default admin screen)                |
| `/admin/bookings/:id`         | booking detail, status actions, admin notes         |
| `/admin/packages`             | package list + create/edit form                     |
| `/admin/pages`                | page list                                           |
| `/admin/pages/:id`            | section editor (add, edit, reorder, hide, delete)   |
| `/admin/settings`             | site settings                                       |
| `/admin/users`                | admin users (owner only)                            |

### Features

Folders under `src/features/`: `site`, `pages`, `packages`, `bookings`, `auth`, `uploads`,
`admin-users`. Each follows the `AGENTS.md` layout (`api.ts`, `queryKeys.ts`, `hooks.ts`,
`types.ts`, `components/`).

### Section rendering

A `SECTION_COMPONENTS` map, keyed by `SectionType`, holds one component per section type. Adding
a section type means adding one backend schema, one frontend type, one renderer and one editor
form.

### Forms

`react-hook-form` + `zod`. Zod schemas mirror the backend limits, which come from shared
constants in each feature's `types.ts`. The backend still validates everything.

### Design

Styling is Tailwind only, with brand tokens in `@theme`. Visual design is handled in the
implementation plan (frontend-design pass). The admin panel is plain and functional.

## 9. Error handling

- **Services** raise domain exceptions (`NotFoundError`, `ConflictError`, `PermissionDeniedError`,
  `InvalidTransitionError`). One exception handler in `main.py` maps them to HTTP status codes.
- **Unexpected errors** are logged and return a generic 500 message. Stack traces never reach
  the client.
- **Frontend:** `ApiError` carries the status. Query hooks surface error states; forms show field
  errors from 422 responses.

## 10. Testing

- **Backend:**
  - `pytest` runs against `TEST_DATABASE_URL`, a separate Postgres (a second free Supabase
    project, or local Postgres). It never runs against the real database.
  - Tables are created once per session, and each test runs inside a rolled-back transaction.
- **Coverage:**
  - Service tests: booking rules (lead time, inactive package, transitions, snapshots),
    section content validation, auth.
  - Endpoint tests: auth required, owner-only routes, pagination.
  - A **query-count test** for each list endpoint (the `assert_max_queries` helper), so query
    count doesn't grow with row count.
- **Frontend:** `npm run lint && npm run build` (type check). Component tests are deferred;
  critical flows are checked manually with Playwright during development.

## 11. Settings added

`JWT_SECRET`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `BUSINESS_TIMEZONE`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_BUCKET`, `TEST_DATABASE_URL`, all documented in
`backend/.env.example`.

## 12. Build order

The public website is built first so the client can see and react to the look early.

1. **Public site (frontend only):** landing page with hero, packages menu, how-it-works, flavors,
   FAQ and the booking form. It uses sample content from `src/features/site/content.ts` and
   sample packages until the CMS API exists. The booking form posts to `POST /bookings` and shows
   a clear error until the backend endpoint is live.
2. Backend core: enums, domain errors and handler, pagination, test DB fixtures, query counter.
3. Bookings + packages backend: models, public create/list, which makes the booking form live.
4. Auth: `admin_users`, login, current-admin dependencies, create-owner CLI.
5. CMS: site settings, pages, sections (with a seeded home page), image upload. The public site
   switches from sample content to the API.
6. Frontend admin foundation: router, layouts, auth flow, API client auth header.
7. Admin screens: bookings, packages, pages/sections, settings, users.
