from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from app.core.constants import MAX_EMAIL_LENGTH
from app.modules.auth.constants import ADMIN_NAME_MAX_LENGTH
from app.modules.auth.enums import AdminRole, AdminStatus


class AdminRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: AdminRole


class AdminListItem(AdminRead):
    is_active: bool
    status: AdminStatus
    last_sign_in_at: datetime | None


class AdminInvite(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: Annotated[EmailStr, Field(max_length=MAX_EMAIL_LENGTH)]
    full_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=ADMIN_NAME_MAX_LENGTH),
    ]
    role: AdminRole


class AdminInvited(BaseModel):
    admin: AdminListItem
    # One-time link the owner shares with the new admin so they can set their password.
    invite_link: str


class SignInLink(BaseModel):
    invite_link: str


class AdminUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: AdminRole | None = None
    is_active: bool | None = None
