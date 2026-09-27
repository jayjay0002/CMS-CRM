import uuid
from collections.abc import Iterator
from datetime import date, time, timedelta
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.supabase import get_token_verifier
from app.modules.bookings.enums import BookingStatus
from app.modules.notifications import EmailStatus, EmailTemplate, get_email_dispatcher
from app.modules.notifications.constants import NOT_CONFIGURED
from app.modules.notifications.models import EmailLog
from app.modules.notifications.rendering import format_long_date, format_time
from app.modules.packages.models import Package
from tests.conftest import FIXED_TODAY, FakeEmailSender, make_dispatcher
from tests.factories import make_admin, make_booking, make_package
from tests.query_counter import QueryCounter

BOOKINGS_URL = "/api/v1/bookings"
ADMIN_BOOKINGS_URL = "/api/v1/admin/bookings"


class FakeVerifier:
    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


@pytest.fixture
def package(db: Session) -> Package:
    return make_package(db, slug="party-pop", name="The Party Pop")


@pytest.fixture
def admin_headers(db: Session) -> Iterator[dict[str, str]]:
    admin = make_admin(db)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    yield {"Authorization": f"Bearer {admin.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)


def booking_payload(**overrides: Any) -> dict[str, Any]:
    payload = {
        "package_slug": "party-pop",
        "event_date": date(2026, 10, 17).isoformat(),
        "event_start_time": "18:30",
        "venue_address": "123 Peachtree St NE, Atlanta, GA",
        "guest_count": 120,
        "customer_name": "Jordan Lee",
        "customer_phone": "(404) 555-0199",
        "customer_email": "jordan@example.com",
        "website": "",
    }
    return payload | overrides


def email_logs(db: Session) -> list[EmailLog]:
    return list(db.scalars(select(EmailLog).order_by(EmailLog.id)).all())


# ---------------------------------------------------------------- Formatting


def test_date_and_time_formats() -> None:
    assert format_long_date(date(2026, 10, 17)) == "Saturday, October 17, 2026"
    assert format_time(time(18, 30)) == "6:30 PM"
    assert format_time(time(9, 5)) == "9:05 AM"


# ---------------------------------------------------------------- Booking received


@pytest.mark.usefixtures("package")
def test_new_booking_emails_the_customer(
    client: TestClient, db: Session, email_sender: FakeEmailSender
) -> None:
    response = client.post(BOOKINGS_URL, json=booking_payload())

    assert response.status_code == 201
    [email] = email_sender.sent
    reference = response.json()["reference"]
    assert email.to_address == "jordan@example.com"
    assert email.subject == f"We got your booking request ({reference})"
    assert "Saturday, October 17, 2026" in email.html
    assert "6:30 PM" in email.text
    assert "Thanks, Jordan!" in email.text
    [log] = email_logs(db)
    assert (log.template, log.status, log.provider_message_id) == (
        EmailTemplate.BOOKING_RECEIVED,
        EmailStatus.SENT,
        "fake-1",
    )
    assert log.booking_id is not None


@pytest.mark.usefixtures("package")
def test_honeypot_booking_sends_nothing(
    client: TestClient, db: Session, email_sender: FakeEmailSender
) -> None:
    client.post(BOOKINGS_URL, json=booking_payload(website="http://spam.example"))

    assert email_sender.sent == []
    assert email_logs(db) == []


@pytest.mark.usefixtures("package")
def test_test_recipient_gets_every_email(
    client: TestClient, db: Session, email_sender: FakeEmailSender
) -> None:
    dispatcher = make_dispatcher(db, email_sender, test_recipient="dev@example.com")
    app.dependency_overrides[get_email_dispatcher] = lambda: dispatcher

    client.post(BOOKINGS_URL, json=booking_payload())

    [email] = email_sender.sent
    assert email.to_address == "dev@example.com"
    assert email.subject.startswith("[TEST → jordan@example.com] ")
    assert email_logs(db)[0].to_address == "dev@example.com"


@pytest.mark.usefixtures("package")
def test_provider_failure_is_logged_without_breaking_the_booking(
    client: TestClient, db: Session, email_sender: FakeEmailSender
) -> None:
    email_sender.fail = True

    response = client.post(BOOKINGS_URL, json=booking_payload())

    assert response.status_code == 201
    [log] = email_logs(db)
    assert log.status is EmailStatus.FAILED
    assert log.error == "Provider is down"


@pytest.mark.usefixtures("package")
def test_without_an_api_key_emails_are_skipped(client: TestClient, db: Session) -> None:
    app.dependency_overrides[get_email_dispatcher] = lambda: make_dispatcher(db, None)

    response = client.post(BOOKINGS_URL, json=booking_payload())

    assert response.status_code == 201
    [log] = email_logs(db)
    assert (log.status, log.error) == (EmailStatus.SKIPPED, NOT_CONFIGURED)
    assert log.subject.startswith("We got your booking request")


# ---------------------------------------------------------------- Status changes


def test_approving_emails_the_customer(
    client: TestClient,
    db: Session,
    package: Package,
    admin_headers: dict[str, str],
    email_sender: FakeEmailSender,
) -> None:
    booking = make_booking(db, package, event_date=FIXED_TODAY + timedelta(days=16))

    response = client.post(
        f"{ADMIN_BOOKINGS_URL}/{booking.id}/status",
        json={"status": "approved"},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "approved"
    [email] = email_sender.sent
    assert email.to_address == booking.customer_email
    assert email.subject.startswith(f"You're booked! {package.name} on ")
    assert email_logs(db)[0].template is EmailTemplate.BOOKING_APPROVED


def test_status_change_can_skip_the_email(
    client: TestClient,
    db: Session,
    package: Package,
    admin_headers: dict[str, str],
    email_sender: FakeEmailSender,
) -> None:
    booking = make_booking(db, package)

    client.post(
        f"{ADMIN_BOOKINGS_URL}/{booking.id}/status",
        json={"status": "approved", "notify_customer": False},
        headers=admin_headers,
    )

    assert email_sender.sent == []


def test_decline_email_includes_the_message_safely(
    client: TestClient,
    db: Session,
    package: Package,
    admin_headers: dict[str, str],
    email_sender: FakeEmailSender,
) -> None:
    booking = make_booking(db, package)
    message = "We're booked that day. <b>Sorry!</b>"

    client.post(
        f"{ADMIN_BOOKINGS_URL}/{booking.id}/status",
        json={"status": "declined", "message": f"  {message}  "},
        headers=admin_headers,
    )

    [email] = email_sender.sent
    assert email.subject == f"About your booking request ({booking.reference})"
    assert message in email.text
    assert "&lt;b&gt;Sorry!&lt;/b&gt;" in email.html
    assert "<b>Sorry!</b>" not in email.html


@pytest.mark.parametrize("status", [BookingStatus.CANCELLED, BookingStatus.COMPLETED])
def test_other_status_changes_send_no_email(
    client: TestClient,
    db: Session,
    package: Package,
    admin_headers: dict[str, str],
    email_sender: FakeEmailSender,
    status: BookingStatus,
) -> None:
    booking = make_booking(db, package, status=BookingStatus.APPROVED)

    client.post(
        f"{ADMIN_BOOKINGS_URL}/{booking.id}/status",
        json={"status": status.value},
        headers=admin_headers,
    )

    assert email_sender.sent == []


def test_decline_message_has_a_limit(
    client: TestClient, db: Session, package: Package, admin_headers: dict[str, str]
) -> None:
    booking = make_booking(db, package)

    response = client.post(
        f"{ADMIN_BOOKINGS_URL}/{booking.id}/status",
        json={"status": "declined", "message": "x" * 1001},
        headers=admin_headers,
    )

    assert response.status_code == 422


# ---------------------------------------------------------------- Email log


def test_email_log_for_a_booking_newest_first(
    client: TestClient, db: Session, package: Package, admin_headers: dict[str, str]
) -> None:
    booking = make_booking(db, package)
    url = f"{ADMIN_BOOKINGS_URL}/{booking.id}"
    client.post(f"{url}/status", json={"status": "approved"}, headers=admin_headers)
    client.post(f"{url}/status", json={"status": "cancelled"}, headers=admin_headers)

    body = client.get(f"{url}/emails", headers=admin_headers).json()

    assert [row["template"] for row in body] == ["booking_approved"]
    assert set(body[0]) == {
        "id",
        "template",
        "to_address",
        "subject",
        "status",
        "error",
        "created_at",
    }


def test_email_log_requires_admin_and_known_booking(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    assert (
        client.get(f"{ADMIN_BOOKINGS_URL}/999999/emails", headers=admin_headers).status_code == 404
    )
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    assert client.get(f"{ADMIN_BOOKINGS_URL}/1/emails").status_code == 401


def test_email_log_query_count_is_constant(
    client: TestClient,
    db: Session,
    package: Package,
    admin_headers: dict[str, str],
    query_counter: QueryCounter,
) -> None:
    booking = make_booking(db, package)
    url = f"{ADMIN_BOOKINGS_URL}/{booking.id}"
    db.add(
        EmailLog(
            booking_id=booking.id,
            template=EmailTemplate.BOOKING_RECEIVED,
            to_address="a@example.com",
            subject="s",
            status=EmailStatus.SENT,
        )
    )
    db.flush()
    with query_counter.measure() as queries_for_one:
        client.get(f"{url}/emails", headers=admin_headers)

    for _ in range(5):
        db.add(
            EmailLog(
                booking_id=booking.id,
                template=EmailTemplate.BOOKING_APPROVED,
                to_address="a@example.com",
                subject="s",
                status=EmailStatus.SENT,
            )
        )
    db.flush()
    with query_counter.measure() as queries_for_many:
        client.get(f"{url}/emails", headers=admin_headers)

    assert queries_for_many() == queries_for_one()
