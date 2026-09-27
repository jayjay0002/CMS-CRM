# Import every model module here so Alembic's autogenerate can see it.
from app.db.base import Base
from app.models.booking import Booking
from app.models.package import Package

__all__ = ["Base", "Booking", "Package"]
