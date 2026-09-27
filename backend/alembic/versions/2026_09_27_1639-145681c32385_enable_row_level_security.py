"""enable row level security

Supabase exposes every table in the public schema through its Data API, reachable with the
publishable key that ships in the website bundle. All data access goes through our FastAPI
backend (which connects as the table owner and is not subject to RLS), so we enable RLS with
no policies: the Data API's anon/authenticated roles can then read and write nothing.

Revision ID: 145681c32385
Revises: 1867d8c1dd99
Create Date: 2026-09-27 16:39:09.490135

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "145681c32385"
down_revision: str | Sequence[str] | None = "1867d8c1dd99"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLES = (
    "packages",
    "bookings",
    "admin_users",
    "site_settings",
    "page_sections",
    "alembic_version",
)


def upgrade() -> None:
    for table in TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    for table in TABLES:
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")
