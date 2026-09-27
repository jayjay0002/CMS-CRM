from pydantic import BaseModel, ConfigDict

from app.modules.auth.enums import AdminRole


class AdminRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: AdminRole
