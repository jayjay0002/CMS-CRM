# Proposals and customer emails (option C)

- **Date:** 2026-09-27
- **Status:** Approved (option C)
- **Coding rules:** `AGENTS.md` (modular monolith backend, FSD frontend, RLS on every new table).

## Goal

1. **Automatic emails** to customers:
   - booking received
   - booking approved
   - booking declined (with an optional personal message)
2. **Proposal builder:**
   - The admin builds a quote for a booking: line items, discount, deposit, expiry and a note.
   - Sending it emails the customer a secret link.
   - The customer views the proposal on the site and accepts or declines it.
   - Accepting approves the booking.
3. **Email log per booking,** so the admin can see what was sent and whether it was delivered.

## Email delivery (`notifications` module)

- **Provider:** Resend, through its REST API (`POST https://api.resend.com/emails`, `Authorization: Bearer <RESEND_API_KEY>`).
- **Settings:**

  | Setting                 | Meaning |
  | ----------------------- | ------- |
  | `RESEND_API_KEY`        | optional; when missing, emails are logged with status `skipped` and not sent |
  | `EMAIL_FROM`            | e.g. `The Red Popcorn Wagon <bookings@theredpopcornwagon.com>`; default `onboarding@resend.dev`, which Resend only delivers to the account owner |
  | `EMAIL_REPLY_TO`        | optional |
  | `EMAIL_TEST_RECIPIENT`  | optional; when set, every email goes there instead of the real recipient (the subject is prefixed `[TEST → original@addr]`). Use until the domain is verified. |

- **Sending:** emails go out after the request commits, via FastAPI `BackgroundTasks`, so a slow or failed send never breaks a booking or a status change.
- **`email_log` table:** `id`, `booking_id` (FK, nullable), `proposal_id` (FK, nullable), `template`, `to_address`, `subject`, `status` (`sent` | `failed` | `skipped`), `provider_message_id`, `error`, `created_at`. RLS on.
- **Templates:** Jinja2 with autoescaping, as HTML plus a plain-text version. They use the site's theme colors, business name, phone and email.

| template            | to            | when                                               |
| ------------------- | ------------- | -------------------------------------------------- |
| `booking_received`  | customer      | `POST /bookings` succeeds (not for honeypot hits)   |
| `booking_approved`  | customer      | status → approved, if `notify_customer`            |
| `booking_declined`  | customer      | status → declined, if `notify_customer`; includes `message` |
| `proposal_sent`     | customer      | proposal sent; includes the link and summary       |
| `proposal_response` | business email (site settings) | customer accepts or declines        |

- **Status change request:** `POST /admin/bookings/{id}/status` accepts `{ status, notify_customer = true, message? (≤ 1000) }`.

## Proposals (`proposals` module)

### Tables

**`proposals`** (RLS on):

| column            | type             | notes |
| ----------------- | ---------------- | ----- |
| `booking_id`      | FK, indexed      | one booking can have several proposals (revisions) |
| `public_token`    | `String(64)`     | unique, `secrets.token_urlsafe(32)` |
| `status`          | enum             | `draft` / `sent` / `accepted` / `declined` |
| `message`         | `Text`           | ≤ 2000, optional |
| `discount`        | `Numeric(12,2)`  | ≥ 0 |
| `deposit`         | `Numeric(12,2)`  | ≥ 0 |
| `valid_until`     | `Date`           | |
| `sent_at`, `viewed_at`, `responded_at` | `DateTime(tz)` | nullable |
| `decline_reason`  | `Text`           | ≤ 1000, nullable |

**`proposal_items`** (RLS on):

| column        | type            | notes |
| ------------- | --------------- | ----- |
| `proposal_id` | FK              | cascade delete |
| `position`    | `Integer`       | |
| `description` | `String(200)`   | |
| `quantity`    | `Integer`       | 1–1000 |
| `unit_price`  | `Numeric(12,2)` | ≥ 0 |

### Rules

- **Totals** are computed by the service and never stored:
  - `subtotal` = Σ quantity × unit_price
  - `total` = max(subtotal − discount, 0)
  - `deposit` must be ≤ total
  - `balance` = total − deposit
- **"Expired"** is derived, not stored: `status = sent` and `valid_until < today` (Atlanta time).
- **Only drafts are editable.** A sent, accepted or declined proposal is read-only; "Duplicate as new draft" copies it.
- **Sending needs:**
  - at least 1 item
  - `total > 0`
  - `valid_until` ≥ today
  - a booking status of pending or approved
- **Accepting:**
  - requires status `sent`, not expired, and a booking status of pending or approved
  - sets the proposal to `accepted` and `responded_at`
  - if the booking is pending, sets it to approved (without sending the separate "approved" email, since the acceptance email covers it)
  - notifies the business
- **Declining:** requires the same checks, then sets the status to `declined` and stores the optional reason.
- **Viewing** records `viewed_at` the first time only.
- **New draft defaults:** one item with the booking's package name and price at booking time, a deposit of 0, and `valid_until` 14 days from today.

### API

**Admin (owners and staff):**

| Method | Path                                       | Body / returns |
| ------ | ------------------------------------------ | -------------- |
| GET    | `/admin/bookings/{id}/proposals`           | list (newest first) with totals + derived `is_expired` |
| POST   | `/admin/bookings/{id}/proposals`           | new draft with defaults → 201 |
| GET    | `/admin/proposals/{pid}`                   | detail (items, totals, status, timestamps, `public_url`) |
| PUT    | `/admin/proposals/{pid}`                   | draft only: `{ items: [{description, quantity, unit_price}], discount, deposit, valid_until, message }` |
| POST   | `/admin/proposals/{pid}/send`              | → detail; emails the customer |
| POST   | `/admin/proposals/{pid}/duplicate`         | → new draft (201) |
| DELETE | `/admin/proposals/{pid}`                   | drafts only → 204 |
| GET    | `/admin/bookings/{id}/emails`              | email log for the booking (newest first) |

**Public (no auth; token in the URL):**

| Method | Path                           | Body / returns |
| ------ | ------------------------------ | -------------- |
| GET    | `/proposals/{token}`           | business name/phone/email, customer first name, event summary (package, date, time, venue, guests), items, totals, message, status, `valid_until`, `is_expired` |
| POST   | `/proposals/{token}/accept`    | → public view |
| POST   | `/proposals/{token}/decline`   | `{ reason? }` → public view |

- An unknown token returns 404.
- The public page is at `/proposal/{token}` (frontend) and sets `noindex`.

## Frontend (FSD)

- **Booking detail page:**
  - A "Proposals" card: the list with status badges and totals, "Create proposal", and open or duplicate actions.
  - The status actions gain a "Email the customer" checkbox (default on). Decline also gets an optional message field.
  - An "Emails" card listing the log: template, recipient, time and status.
- **Proposal editor** (`/admin/proposals/:id`):
  - Line items: add, remove and reorder, with description, quantity and unit price.
  - Discount, deposit, valid until and message, with live totals.
  - Save draft, then "Send to customer" (confirm step), which shows the link with a Copy button.
  - Read-only once sent, with "Duplicate as new draft".
  - A preview of the customer-facing view.
- **Public proposal page** (`/proposal/:token`):
  - Branded with the theme; shows the event and itemized quote.
  - Accept and Decline, with an optional reason and a confirm step; states for accepted, declined, expired and not found.

## Testing

- **Backend:**
  - Totals and deposit rules.
  - Draft-only edits.
  - Send, accept and decline rules, including expiry.
  - Accepting approves a pending booking.
  - Token lookup and 404.
  - Emails are logged per template, with a fake sender. The test-recipient redirect works. A sender failure is logged as `failed` without breaking the request.
  - Status-change `notify_customer`.
  - RLS migration.
- **Frontend:** lint and build, plus Playwright with mocked admin APIs and a real public proposal flow on test data.
