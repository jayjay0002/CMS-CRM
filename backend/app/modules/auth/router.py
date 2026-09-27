from fastapi import APIRouter

from app.modules.auth.dependencies import CurrentAdminDep
from app.modules.auth.models import AdminUser
from app.modules.auth.schemas import AdminRead

# Sign-in happens in the browser with Supabase Auth; the API only checks who is signed in.
router = APIRouter(prefix="/admin/auth", tags=["admin auth"])


@router.get("/me", response_model=AdminRead)
def read_current_admin(admin: CurrentAdminDep) -> AdminUser:
    return admin
