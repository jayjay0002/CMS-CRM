from decimal import Decimal
from itertools import count
from typing import Any

from sqlalchemy.orm import Session

from app.models import Package

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
