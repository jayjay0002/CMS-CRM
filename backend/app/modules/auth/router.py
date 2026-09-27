from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import SessionDep
from app.modules.auth import service as auth_service
from app.modules.auth.dependencies import CurrentAdminDep, OwnerDep
from app.modules.auth.models import AdminUser
from app.modules.auth.schemas import (
    AdminInvite,
    AdminInvited,
    AdminListItem,
    AdminRead,
    AdminUpdate,
    SignInLink,
)
from app.modules.auth.supabase import SupabaseAdminClient, get_admin_client

# Sign-in happens in the browser with Supabase Auth; the API only checks who is signed in.
router = APIRouter(prefix="/admin/auth", tags=["admin auth"])


@router.get("/me", response_model=AdminRead)
def read_current_admin(admin: CurrentAdminDep) -> AdminUser:
    return admin


# ---------------------------------------------------------------- Managing admins (owners only)

admin_users_router = APIRouter(prefix="/admin/users", tags=["admin users"])

SupabaseAdminDep = Annotated[SupabaseAdminClient, Depends(get_admin_client)]


@admin_users_router.get("", response_model=list[AdminListItem])
def list_admins(
    _owner: OwnerDep, db: SessionDep, supabase: SupabaseAdminDep
) -> list[AdminListItem]:
    return auth_service.list_admins(db, supabase)


@admin_users_router.post("", response_model=AdminInvited, status_code=status.HTTP_201_CREATED)
def invite_admin(
    payload: AdminInvite, _owner: OwnerDep, db: SessionDep, supabase: SupabaseAdminDep
) -> AdminInvited:
    admin, link = auth_service.invite_admin(db, supabase, payload)
    return AdminInvited(admin=auth_service.to_list_item(admin, None), invite_link=link)


@admin_users_router.post("/{admin_id}/sign-in-link", response_model=SignInLink)
def new_sign_in_link(
    admin_id: int, _owner: OwnerDep, db: SessionDep, supabase: SupabaseAdminDep
) -> SignInLink:
    return SignInLink(invite_link=auth_service.new_sign_in_link(db, supabase, admin_id))


@admin_users_router.patch("/{admin_id}", response_model=AdminListItem)
def update_admin(
    admin_id: int,
    payload: AdminUpdate,
    owner: OwnerDep,
    db: SessionDep,
    supabase: SupabaseAdminDep,
) -> AdminListItem:
    admin = auth_service.update_admin(db, owner, admin_id, payload)
    return auth_service.to_list_item(admin, supabase.list_users().get(admin.auth_user_id))
