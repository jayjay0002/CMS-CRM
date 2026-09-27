from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import SessionDep

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/db")
def health_db(db: SessionDep) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
