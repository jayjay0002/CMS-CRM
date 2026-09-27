"""Auth module: admin accounts (Supabase Auth sign-in + our admin_users allowlist).

Public API for other modules: guard admin routes with these dependencies.
"""

from app.modules.auth.dependencies import CurrentAdminDep, OwnerDep, get_current_admin

# For router-level guards: APIRouter(dependencies=[Depends(require_admin)]).
require_admin = get_current_admin

__all__ = ["CurrentAdminDep", "OwnerDep", "require_admin"]
