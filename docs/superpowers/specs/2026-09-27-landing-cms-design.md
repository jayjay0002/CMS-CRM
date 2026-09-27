# Landing page CMS (option A: edit everything, fixed layout)

- **Date:** 2026-09-27
- **Status:** Approved (option A chosen by the client)
- **Coding rules:** `AGENTS.md`. The backend is a modular monolith; the frontend uses FSD.

## Goal

The owner edits all landing-page text and business info from the admin panel:

- show/hide sections
- reorder sections
- edit every section's text and lists

The page design itself stays fixed.

**Out of scope for this phase:**

- image uploads (these need Supabase Storage; the hero keeps the drawn cart)
- new section types
- extra pages
- a draft/publish workflow (edits go live on save)

## Backend: new module `app/modules/content/`

### Tables

**`site_settings`** is a single row (`id = 1`) of business info:

| column             | type          | limit | notes                    |
| ------------------ | ------------- | ----- | ------------------------ |
| `business_name`    | `String(80)`  |       | required                 |
| `tagline`          | `String(160)` |       |                          |
| `phone_display`    | `String(30)`  |       | e.g. `(404) 555-0147`    |
| `phone_e164`       | `String(20)`  |       | e.g. `+14045550147`, for `tel:` links |
| `email`            | `String(255)` |       |                          |
| `instagram_handle` | `String(60)`  |       | e.g. `@theredpopcornwagon` |
| `instagram_url`    | `String(500)` |       |                          |
| `service_area`     | `String(80)`  |       |                          |

**`page_sections`**:

| column         | type          | notes                                      |
| -------------- | ------------- | ------------------------------------------ |
| `page`         | `String(40)`  | always `home` for now                      |
| `section_type` | `SectionType` | Postgres enum                              |
| `position`     | `Integer`     | order on the page                          |
| `is_visible`   | `Boolean`     |                                            |
| `content`      | `JSONB`       | validated per type (below)                 |

`(page, section_type)` is unique: each section appears once on the home page.

### Section types and content

| type            | content fields (limits)                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| `hero`          | `headline` (≤ 80; a line break splits it into animated lines, max 4 lines); `description` (≤ 400); `primary_cta_label`, `secondary_cta_label` (≤ 40); `highlights` (0–5 items, each ≤ 60) |
| `event_types`   | `items` (1–12, each ≤ 40)                                                                  |
| `packages_menu` | `heading` (≤ 60), `description` (≤ 300). The packages themselves come from the packages module. |
| `how_it_works`  | `heading` (≤ 60), `steps` (1–6 of `{title ≤ 60, body ≤ 300}`), `cta_label` (≤ 40)          |
| `flavors`       | `heading` (≤ 60), `description` (≤ 300), `items` (1–12 of `{name ≤ 40, color}`); `color` is one of `butter`, `kernel`, `caramel`, `butter_soft`, `ink`, `cherry` |
| `faq`           | `heading` (≤ 60), `intro` (≤ 200), `items` (1–20 of `{question ≤ 150, answer ≤ 800}`)      |
| `booking`       | `heading` (≤ 60), `description` (≤ 300), `phone_prompt` (≤ 60)                             |

- **Validation:** each type has a Pydantic model, with extra fields forbidden. All strings are trimmed and must not be empty, except the optional `intro` and `highlights`.
- **Stored shape:** the service validates `content` against its type's model and saves it as JSON.

### Rules

- **Always visible:** `hero` and `booking` can't be hidden (422), because every "Book" button scrolls to the booking section and the page needs a top.
- **Reordering:** the request must list **every** section type on the page exactly once (422 otherwise).
- **Default content:** `seed-content` (idempotent) inserts the settings row and any missing sections. The defaults are the current live text, kept in `content/defaults.py`. `dev_local.py` runs it automatically.

### API (`/api/v1`)

**Public:**

| Method | Path    | Returns |
| ------ | ------- | ------- |
| GET    | `/site` | `{ settings, sections: [{ type, content }] }`, visible sections only, ordered. Two queries regardless of size. |

**Admin (`CurrentAdminDep`; owner or staff):**

| Method | Path                                       | Body / returns |
| ------ | ------------------------------------------ | -------------- |
| GET    | `/admin/site/settings`                     | settings |
| PUT    | `/admin/site/settings`                     | full settings → settings |
| GET    | `/admin/site/sections`                     | `[{ type, position, is_visible, content }]`, all sections, ordered |
| PUT    | `/admin/site/sections/{type}/content`      | content for that type → section |
| PATCH  | `/admin/site/sections/{type}/visibility`   | `{ is_visible }` → section |
| PUT    | `/admin/site/sections/order`               | `{ types: [...] }` → sections, ordered |

- **Errors:** 404 for an unknown section type on the page, 422 for validation or rule violations.
- **JSON keys** are snake_case.

## Frontend (FSD)

- **`entities/site`:** types that mirror the API (`SECTION_TYPES` as a const plus a union; one content type per section type), `fetchSite`, `useSite`, admin API functions, and a query-key factory.
- **Public page (`pages/home`):** renders visible sections in order through a `SECTION_WIDGETS` map from type to widget.
  - Widgets receive their content as props instead of reading constants.
  - Header, footer, the FAQ phone link and the booking section read business info from `settings`.
  - Header nav links come from the visible sections, with fixed labels per type.
  - The `#book` and `#packages` anchors keep working.
  - While loading, the page shows a simple branded placeholder. On error it shows a message with a retry.
- **Admin:**
  - The admin layout gets navigation: **Dashboard** and **Website**.
  - `pages/admin-website`:
    - **Business info** form (`features/edit-site-settings`).
    - **Sections** list, one row per section showing the name, the Visible/Hidden state and a short summary, with these controls:
      - Edit (`features/edit-section`: one form per type; list fields can add, remove and move items)
      - Show/Hide toggle (`features/toggle-section-visibility`; disabled for hero and booking, with a tooltip explaining why)
      - Move up/down (`features/reorder-sections`)
    - A **View site** link that opens `/` in a new tab.
  - Saves invalidate the site query keys. Forms mirror the backend limits with zod and show the server's 422 message if one comes back.

## Testing

- **Backend:**
  - Content validation for each type: valid content, extra fields and over-limit values.
  - Admin endpoints require auth (401/403).
  - Hero and booking can't be hidden.
  - Reorder must be a complete permutation.
  - `/site` hides hidden sections and keeps the order, and its query count stays constant.
  - `seed-content` is idempotent.
- **Frontend:**
  - Lint and build pass.
  - Playwright: the public page renders from the API. After changing content through the API, the page shows the new text.
