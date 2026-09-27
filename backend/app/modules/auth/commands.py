import getpass
import logging
import sys

from app.core.errors import DomainError
from app.db.session import SessionLocal
from app.modules.auth.enums import AdminRole
from app.modules.auth.service import create_admin
from app.modules.auth.supabase import get_admin_client

logger = logging.getLogger(__name__)


def prompt_new_password() -> str:
    password = getpass.getpass("Password: ")
    if getpass.getpass("Repeat password: ") != password:
        sys.exit("Passwords don't match")
    return password


def create_owner(email: str, name: str) -> None:
    """Creates a Supabase Auth account plus an owner row in admin_users."""
    password = prompt_new_password()
    with SessionLocal() as db:
        try:
            admin = create_admin(
                db,
                get_admin_client(),
                email=email,
                full_name=name,
                password=password,
                role=AdminRole.OWNER,
            )
        except DomainError as error:
            sys.exit(error.detail)
    logger.info("Created owner %s. Sign in at /admin.", admin.email)
