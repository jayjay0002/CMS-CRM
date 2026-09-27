import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import BusinessRuleError, ConflictError, NotFoundError
from app.modules.auth.constants import MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, SET_PASSWORD_PATH
from app.modules.auth.enums import AdminRole, AdminStatus, AuthLinkType
from app.modules.auth.models import AdminUser
from app.modules.auth.schemas import AdminInvite, AdminListItem, AdminUpdate
from app.modules.auth.supabase import AuthUserInfo, SupabaseAdminClient

MUST_KEEP_AN_OWNER = "There must always be at least one active owner"
CANNOT_CHANGE_SELF = "You can't change your own role or deactivate yourself"


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


# ---------------------------------------------------------------- Managing admins (owner only)


def set_password_redirect_url() -> str:
    return f"{settings.frontend_url.rstrip('/')}{SET_PASSWORD_PATH}"


def admin_status(admin: AdminUser, auth_user: AuthUserInfo | None) -> AdminStatus:
    if not admin.is_active:
        return AdminStatus.DEACTIVATED
    if auth_user is None or auth_user.last_sign_in_at is None:
        return AdminStatus.INVITED
    return AdminStatus.ACTIVE


def to_list_item(admin: AdminUser, auth_user: AuthUserInfo | None) -> AdminListItem:
    return AdminListItem(
        id=admin.id,
        email=admin.email,
        full_name=admin.full_name,
        role=admin.role,
        is_active=admin.is_active,
        status=admin_status(admin, auth_user),
        last_sign_in_at=auth_user.last_sign_in_at if auth_user else None,
    )


def list_admins(db: Session, supabase: SupabaseAdminClient) -> list[AdminListItem]:
    admins = db.scalars(select(AdminUser).order_by(AdminUser.created_at, AdminUser.id)).all()
    # One Supabase request for everyone, not one per admin.
    auth_users = supabase.list_users()
    return [to_list_item(admin, auth_users.get(admin.auth_user_id)) for admin in admins]


def invite_admin(
    db: Session, supabase: SupabaseAdminClient, data: AdminInvite
) -> tuple[AdminUser, str]:
    """Creates the Supabase account + admin row and returns a link to set a password."""
    email = normalize_email(str(data.email))
    if find_admin_by_email(db, email) is not None:
        raise ConflictError("That person is already an admin")

    link = supabase.generate_link(AuthLinkType.INVITE, email, set_password_redirect_url())
    admin = AdminUser(
        auth_user_id=link.auth_user_id, email=email, full_name=data.full_name, role=data.role
    )
    db.add(admin)
    db.commit()
    return admin, link.action_link


def get_admin(db: Session, admin_id: int) -> AdminUser:
    admin = db.get(AdminUser, admin_id)
    if admin is None:
        raise NotFoundError("Admin not found")
    return admin


def new_sign_in_link(db: Session, supabase: SupabaseAdminClient, admin_id: int) -> str:
    """A fresh invite link if they never signed in, otherwise a password-reset link."""
    admin = get_admin(db, admin_id)
    if not admin.is_active:
        raise BusinessRuleError("Reactivate this admin before sending them a link")
    auth_user = supabase.list_users().get(admin.auth_user_id)
    has_signed_in = auth_user is not None and auth_user.last_sign_in_at is not None
    link_type = AuthLinkType.RECOVERY if has_signed_in else AuthLinkType.INVITE
    return supabase.generate_link(link_type, admin.email, set_password_redirect_url()).action_link


def _count_active_owners(db: Session) -> int:
    statement = (
        select(func.count())
        .select_from(AdminUser)
        .where(AdminUser.role == AdminRole.OWNER, AdminUser.is_active)
    )
    return db.scalar(statement) or 0


def update_admin(db: Session, actor: AdminUser, admin_id: int, data: AdminUpdate) -> AdminUser:
    admin = get_admin(db, admin_id)
    if admin.id == actor.id:
        raise BusinessRuleError(CANNOT_CHANGE_SELF)

    is_active_owner = admin.role is AdminRole.OWNER and admin.is_active
    loses_owner_access = data.role is AdminRole.STAFF or data.is_active is False
    if is_active_owner and loses_owner_access and _count_active_owners(db) <= 1:
        raise BusinessRuleError(MUST_KEEP_AN_OWNER)

    if data.role is not None:
        admin.role = data.role
    if data.is_active is not None:
        admin.is_active = data.is_active
    db.commit()
    return admin
