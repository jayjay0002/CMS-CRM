import uuid
from decimal import Decimal
from itertools import count
from typing import Any

from sqlalchemy.orm import Session

from app.modules.auth.enums import AdminRole
from app.modules.auth.models import AdminUser
from app.modules.packages.models import Package

_sequence = count(1)


def make_package(db: Session, **overrides: Any) -> Package:
    number = next(_sequence)
    fields: dict[str, Any] = {
        "name": f"Package {number}",
        "slug": f"package-{number}",
        "description": "Fresh popcorn for your guests.",
        "price": Decimal("450.00"),
        "servings": 200,
        "duration_hours": 3,
        "position": number,
    }
    package = Package(**(fields | overrides))
    db.add(package)
    db.flush()
    return package


def make_admin(db: Session, **overrides: Any) -> AdminUser:
    number = next(_sequence)
    fields: dict[str, Any] = {
        "email": f"admin{number}@example.com",
        "full_name": f"Admin {number}",
        "auth_user_id": uuid.uuid4(),
        "role": AdminRole.STAFF,
    }
    admin = AdminUser(**(fields | overrides))
    db.add(admin)
    db.flush()
    return admin
