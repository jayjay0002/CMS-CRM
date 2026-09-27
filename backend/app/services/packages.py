from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models import Package


def list_active_packages(db: Session) -> Sequence[Package]:
    statement = select(Package).where(Package.is_active).order_by(Package.position, Package.id)
    return db.scalars(statement).all()


def find_active_package(db: Session, slug: str) -> Package | None:
    statement = select(Package).where(Package.slug == slug, Package.is_active)
    return db.scalars(statement).one_or_none()


def get_active_package(db: Session, slug: str) -> Package:
    package = find_active_package(db, slug)
    if package is None:
        raise NotFoundError("Package not found")
    return package
