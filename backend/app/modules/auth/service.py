import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError, ConflictError
from app.modules.auth.constants import MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH
from app.modules.auth.enums import AdminRole
from app.modules.auth.models import AdminUser
from app.modules.auth.supabase import SupabaseAdminClient


def normalize_email(email: str) -> str:
    return email.strip().lower()


def find_admin_by_email(db: Session, email: str) -> AdminUser | None:
    statement = select(AdminUser).where(AdminUser.email == normalize_email(email))
    return db.scalars(statement).one_or_none()


def get_active_admin_by_auth_id(db: Session, auth_user_id: uuid.UUID) -> AdminUser | None:
    statement = select(AdminUser).where(AdminUser.auth_user_id == auth_user_id, AdminUser.is_active)
    return db.scalars(statement).one_or_none()


def validate_new_password(password: str) -> None:
    if not MIN_PASSWORD_LENGTH <= len(password) <= MAX_PASSWORD_LENGTH:
        raise BusinessRuleError(
            f"Use a password between {MIN_PASSWORD_LENGTH} and {MAX_PASSWORD_LENGTH} characters"
        )


def create_admin(
    db: Session,
    supabase: SupabaseAdminClient,
    *,
    email: str,
    full_name: str,
    password: str,
    role: AdminRole,
) -> AdminUser:
    """Creates the Supabase Auth account and the matching admin_users row."""
    validate_new_password(password)
    email = normalize_email(email)
    if find_admin_by_email(db, email) is not None:
        raise ConflictError("An admin with that email already exists")

    auth_user_id = supabase.create_user(email, password)
    admin = AdminUser(
        auth_user_id=auth_user_id, email=email, full_name=full_name.strip(), role=role
    )
    db.add(admin)
    db.commit()
    return admin
