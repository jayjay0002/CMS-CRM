"""Imports every module's models so SQLAlchemy metadata (Alembic, tests) sees all tables."""

from app.db.base import Base
from app.modules.auth.models import AdminUser
from app.modules.bookings.models import Booking
from app.modules.packages.models import Package

__all__ = ["AdminUser", "Base", "Booking", "Package"]
