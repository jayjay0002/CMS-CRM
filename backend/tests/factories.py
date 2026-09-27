import uuid
from datetime import date, time, timedelta
from decimal import Decimal
from itertools import count
from typing import Any

from sqlalchemy.orm import Session

from app.modules.auth.enums import AdminRole
from app.modules.auth.models import AdminUser
from app.modules.bookings.enums import BookingStatus
from app.modules.bookings.models import Booking
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


def make_booking(db: Session, package: Package, **overrides: Any) -> Booking:
    number = next(_sequence)
    fields: dict[str, Any] = {
        "reference": f"PC-T{number:05d}",
        "package_id": package.id,
        "package_name": package.name,
        "package_price": package.price,
        "event_date": date(2026, 10, 1) + timedelta(days=number),
        "event_start_time": time(18, 0),
        "venue_address": "123 Peachtree St NE, Atlanta, GA",
        "guest_count": 100,
        "customer_name": f"Customer {number}",
        "customer_phone": "(404) 555-0100",
        "customer_email": f"customer{number}@example.com",
        "status": BookingStatus.PENDING,
    }
    booking = Booking(**(fields | overrides))
    db.add(booking)
    db.flush()
    return booking
