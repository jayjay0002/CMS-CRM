"""timeline section

Revision ID: b7c1d2e3f4a5
Revises: 0cd5e1df31d6
Create Date: 2026-10-06 12:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b7c1d2e3f4a5"
down_revision: str | Sequence[str] | None = "0cd5e1df31d6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'timeline'")


def downgrade() -> None:
    """Downgrade schema."""
    # Postgres can't drop enum values; the 'timeline' value stays, unused.
    op.execute("DELETE FROM page_sections WHERE section_type::text = 'timeline'")
