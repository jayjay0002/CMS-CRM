from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.dependencies import SessionDep
from app.core.errors import AuthenticationError, PermissionDeniedError
from app.modules.auth.enums import AdminRole
from app.modules.auth.models import AdminUser
from app.modules.auth.service import get_active_admin_by_auth_id
from app.modules.auth.supabase import TokenVerifier, get_token_verifier

NOT_SIGNED_IN = "Sign in to continue"
NO_ADMIN_ACCESS = "This account doesn't have admin access"

# auto_error=False so a missing header goes through our AuthenticationError (401, not 403).
_bearer = HTTPBearer(auto_error=False)


def get_current_admin(
    db: SessionDep,
    verifier: Annotated[TokenVerifier, Depends(get_token_verifier)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> AdminUser:
    if credentials is None:
        raise AuthenticationError(NOT_SIGNED_IN)
    auth_user_id = verifier.verify(credentials.credentials)
    if auth_user_id is None:
        raise AuthenticationError(NOT_SIGNED_IN)
    # A valid Supabase account isn't enough: it must be an active admin, checked on every request.
    admin = get_active_admin_by_auth_id(db, auth_user_id)
    if admin is None:
        raise PermissionDeniedError(NO_ADMIN_ACCESS)
    return admin


CurrentAdminDep = Annotated[AdminUser, Depends(get_current_admin)]


def require_owner(admin: CurrentAdminDep) -> AdminUser:
    if admin.role is not AdminRole.OWNER:
        raise PermissionDeniedError("Only the owner can do this")
    return admin


OwnerDep = Annotated[AdminUser, Depends(require_owner)]
