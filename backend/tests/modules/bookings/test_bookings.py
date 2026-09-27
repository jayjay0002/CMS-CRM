import re
from datetime import timedelta
from decimal import Decimal
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.bookings import service as bookings_service
from app.modules.bookings.constants import MAX_BOOKING_ADVANCE_DAYS, MAX_GUEST_COUNT
from app.modules.bookings.enums import BookingStatus
from app.modules.bookings.models import Booking
from tests.conftest import FIXED_TODAY
from tests.factories import make_package

BOOKINGS_URL = "/api/v1/bookings"
REFERENCE_FORMAT = re.compile(r"^PC-[A-HJ-NP-Z2-9]{6}$")


def booking_payload(**overrides: Any) -> dict[str, Any]:
    payload = {
        "package_slug": "party-pop",
        "event_date": (FIXED_TODAY + timedelta(days=30)).isoformat(),
        "event_start_time": "18:30",
        "venue_address": "123 Peachtree St NE, Atlanta, GA",
        "guest_count": 120,
        "customer_name": "Jordan Lee",
        "customer_phone": "(404) 555-0199",
        "customer_email": "jordan@example.com",
        "customer_notes": "Kettle corn please",
        "website": "",
    }
    return payload | overrides


def count_bookings(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(Booking)) or 0


@pytest.fixture
def party_pop(db: Session) -> None:
    make_package(db, slug="party-pop", name="The Party Pop", price=Decimal("450.00"))


@pytest.mark.usefixtures("party_pop")
def test_creates_pending_booking_with_package_snapshot(client: TestClient, db: Session) -> None:
    response = client.post(BOOKINGS_URL, json=booking_payload())

    assert response.status_code == 201
    body = response.json()
    assert REFERENCE_FORMAT.match(body["reference"])
    assert body["status"] == BookingStatus.PENDING
    assert body["package_name"] == "The Party Pop"

    booking = db.scalars(select(Booking)).one()
    assert booking.reference == body["reference"]
    assert booking.package_price == Decimal("450.00")
    assert booking.customer_notes == "Kettle corn please"


@pytest.mark.usefixtures("party_pop")
def test_blank_notes_are_stored_as_null(client: TestClient, db: Session) -> None:
    client.post(BOOKINGS_URL, json=booking_payload(customer_notes="   "))

    assert db.scalars(select(Booking)).one().customer_notes is None


def test_rejects_unknown_package(client: TestClient, db: Session) -> None:
    response = client.post(BOOKINGS_URL, json=booking_payload(package_slug="nope"))

    assert response.status_code == 422
    assert count_bookings(db) == 0


def test_rejects_inactive_package(client: TestClient, db: Session) -> None:
    make_package(db, slug="retired", is_active=False)

    response = client.post(BOOKINGS_URL, json=booking_payload(package_slug="retired"))

    assert response.status_code == 422


@pytest.mark.usefixtures("party_pop")
@pytest.mark.parametrize(
    ("days_from_today", "expected_status"),
    [
        (0, 422),
        (1, 201),
        (MAX_BOOKING_ADVANCE_DAYS, 201),
        (MAX_BOOKING_ADVANCE_DAYS + 1, 422),
    ],
)
def test_event_date_must_be_inside_booking_window(
    client: TestClient, days_from_today: int, expected_status: int
) -> None:
    event_date = (FIXED_TODAY + timedelta(days=days_from_today)).isoformat()

    response = client.post(BOOKINGS_URL, json=booking_payload(event_date=event_date))

    assert response.status_code == expected_status


@pytest.mark.usefixtures("party_pop")
@pytest.mark.parametrize(
    "overrides",
    [
        {"guest_count": 0},
        {"guest_count": MAX_GUEST_COUNT + 1},
        {"customer_email": "not-an-email"},
        {"customer_phone": "call me"},
        {"venue_address": "  "},
        {"customer_name": ""},
    ],
)
def test_rejects_invalid_fields(client: TestClient, db: Session, overrides: dict) -> None:
    response = client.post(BOOKINGS_URL, json=booking_payload(**overrides))

    assert response.status_code == 422
    assert count_bookings(db) == 0


@pytest.mark.usefixtures("party_pop")
def test_honeypot_looks_successful_but_stores_nothing(client: TestClient, db: Session) -> None:
    response = client.post(BOOKINGS_URL, json=booking_payload(website="http://spam.example"))

    assert response.status_code == 201
    assert REFERENCE_FORMAT.match(response.json()["reference"])
    assert count_bookings(db) == 0


@pytest.mark.usefixtures("party_pop")
def test_retries_when_reference_collides(
    client: TestClient, db: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    client.post(BOOKINGS_URL, json=booking_payload())
    taken = db.scalars(select(Booking.reference)).one()
    fresh = "PC-FRESH2"
    references = iter([taken, fresh])
    monkeypatch.setattr(bookings_service, "generate_reference", lambda: next(references))

    response = client.post(BOOKINGS_URL, json=booking_payload())

    assert response.status_code == 201
    assert response.json()["reference"] == fresh
    assert count_bookings(db) == 2
