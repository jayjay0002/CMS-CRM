"""Imports every module's models so SQLAlchemy metadata (Alembic, tests) sees all tables."""

from app.db.base import Base
from app.modules.auth.models import AdminUser
from app.modules.bookings.models import Booking
from app.modules.content.models import PageSection, SiteSettings, SiteTheme
from app.modules.notifications.models import EmailLog
from app.modules.packages.models import Package
from app.modules.proposals.models import Proposal, ProposalItem

__all__ = [
    "AdminUser",
    "Base",
    "Booking",
    "EmailLog",
    "Package",
    "PageSection",
    "Proposal",
    "ProposalItem",
    "SiteSettings",
    "SiteTheme",
]
