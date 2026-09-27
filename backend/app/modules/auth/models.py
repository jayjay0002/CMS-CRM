import uuid

from sqlalchemy import Enum, String, Uuid, true
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import MAX_EMAIL_LENGTH
from app.db.base import Base, TimestampMixin, enum_values
from app.modules.auth.constants import ADMIN_NAME_MAX_LENGTH
from app.modules.auth.enums import AdminRole


class AdminUser(TimestampMixin, Base):
    """Who may use the admin panel. Sign-in itself is handled by Supabase Auth."""

    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # The Supabase Auth user id (the `sub` claim of their access token).
    auth_user_id: Mapped[uuid.UUID] = mapped_column(Uuid, unique=True)
    # Stored lowercase (see service.normalize_email).
    email: Mapped[str] = mapped_column(String(MAX_EMAIL_LENGTH), unique=True)
    full_name: Mapped[str] = mapped_column(String(ADMIN_NAME_MAX_LENGTH))
    role: Mapped[AdminRole] = mapped_column(
        Enum(AdminRole, name="admin_role", values_callable=enum_values)
    )
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())
