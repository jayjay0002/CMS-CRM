# Import every model module here so Alembic's autogenerate can see it.
from app.db.base import Base

__all__ = ["Base"]
