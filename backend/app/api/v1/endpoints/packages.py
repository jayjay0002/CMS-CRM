from collections.abc import Sequence

from fastapi import APIRouter

from app.api.deps import SessionDep
from app.models import Package
from app.schemas.package import PackageRead
from app.services import packages as packages_service

router = APIRouter(prefix="/packages", tags=["packages"])


@router.get("", response_model=list[PackageRead])
def list_packages(db: SessionDep) -> Sequence[Package]:
    return packages_service.list_active_packages(db)


@router.get("/{slug}", response_model=PackageRead)
def get_package(slug: str, db: SessionDep) -> Package:
    return packages_service.get_active_package(db, slug)
