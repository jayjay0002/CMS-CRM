"""Auth module: admin accounts (Supabase Auth sign-in + our admin_users allowlist).

Public API for other modules: guard admin routes with these dependencies.
"""

from app.modules.auth.dependencies import CurrentAdminDep, OwnerDep

__all__ = ["CurrentAdminDep", "OwnerDep"]
