import uuid
from collections.abc import Iterator
from datetime import timedelta
from decimal import Decimal
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.supabase import get_token_verifier
from app.modules.bookings.enums import BookingStatus
from app.modules.bookings.models import Booking
from app.modules.notifications import EmailTemplate
from app.modules.notifications.models import EmailLog
from app.modules.packages.models import Package
from app.modules.proposals.models import Proposal
from tests.conftest import FIXED_TODAY, FakeEmailSender
from tests.factories import make_admin, make_booking, make_package
from tests.query_counter import QueryCounter

ADMIN = "/api/v1/admin"
PUBLIC = "/api/v1/proposals"


class FakeVerifier:
    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


@pytest.fixture
def headers(db: Session) -> Iterator[dict[str, str]]:
    admin = make_admin(db)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    yield {"Authorization": f"Bearer {admin.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)


@pytest.fixture
def package(db: Session) -> Package:
    return make_package(db, name="The Party Pop", price=Decimal("450.00"))


@pytest.fixture
def booking(db: Session, package: Package) -> Booking:
    return make_booking(
        db,
        package,
        customer_name="Jordan Lee",
        customer_email="jordan@example.com",
        event_date=FIXED_TODAY + timedelta(days=20),
    )


def create(client: TestClient, booking: Booking, headers: dict[str, str]) -> dict[str, Any]:
    response = client.post(f"{ADMIN}/bookings/{booking.id}/proposals", headers=headers)
    assert response.status_code == 201
    return response.json()


def edit_body(**overrides: Any) -> dict[str, Any]:
    body = {
        "items": [
            {"description": "The Party Pop", "quantity": 1, "unit_price": "450.00"},
            {"description": "Extra flavor", "quantity": 2, "unit_price": "35.50"},
        ],
        "discount": "21.00",
        "deposit": "100.00",
        "valid_until": (FIXED_TODAY + timedelta(days=10)).isoformat(),
        "message": "  Looking forward to it!  ",
    }
    return body | overrides


def sent_proposal(client: TestClient, booking: Booking, headers: dict[str, str]) -> dict[str, Any]:
    draft = create(client, booking, headers)
    client.put(f"{ADMIN}/proposals/{draft['id']}", json=edit_body(), headers=headers)
    response = client.post(f"{ADMIN}/proposals/{draft['id']}/send", headers=headers)
    assert response.status_code == 200
    return response.json()


def token_of(proposal: dict[str, Any]) -> str:
    return proposal["public_url"].rsplit("/", 1)[1]


def logs(db: Session) -> list[EmailLog]:
    return list(db.scalars(select(EmailLog).order_by(EmailLog.id)).all())


# ---------------------------------------------------------------- Drafts


def test_new_draft_defaults_to_the_booked_package(
    client: TestClient, booking: Booking, headers: dict[str, str]
) -> None:
    draft = create(client, booking, headers)

    assert draft["status"] == "draft"
    assert draft["items"] == [
        {
            "description": "The Party Pop",
            "quantity": 1,
            "unit_price": "450.00",
            "line_total": "450.00",
        }
    ]
    assert (draft["subtotal"], draft["discount"], draft["total"]) == ("450.00", "0.00", "450.00")
    assert (draft["deposit"], draft["balance"]) == ("0.00", "450.00")
    assert draft["valid_until"] == (FIXED_TODAY + timedelta(days=14)).isoformat()
    assert draft["public_url"].startswith("http://localhost:5173/proposal/")
    assert len(token_of(draft)) >= 40
    assert draft["is_expired"] is False


def test_editing_a_draft_recomputes_totals(
    client: TestClient, booking: Booking, headers: dict[str, str]
) -> None:
    draft = create(client, booking, headers)

    response = client.put(f"{ADMIN}/proposals/{draft['id']}", json=edit_body(), headers=headers)

    body = response.json()
    assert response.status_code == 200
    assert [item["line_total"] for item in body["items"]] == ["450.00", "71.00"]
    assert (body["subtotal"], body["total"], body["balance"]) == ("521.00", "500.00", "400.00")
    assert body["message"] == "Looking forward to it!"


@pytest.mark.parametrize(
    ("overrides", "fragment"),
    [
        ({"deposit": "600.00"}, "deposit"),
        ({"items": [{"description": "x", "quantity": 0, "unit_price": "1"}]}, None),
        ({"items": [{"description": "x", "quantity": 1, "unit_price": "-1"}]}, None),
        ({"discount": "1.234"}, None),
        ({"items": [{"description": " ", "quantity": 1, "unit_price": "1"}]}, None),
        ({"surprise": 1}, None),
    ],
)
def test_invalid_edits_are_rejected(
    client: TestClient,
    booking: Booking,
    headers: dict[str, str],
    overrides: dict[str, Any],
    fragment: str | None,
) -> None:
    draft = create(client, booking, headers)

    response = client.put(
        f"{ADMIN}/proposals/{draft['id']}", json=edit_body(**overrides), headers=headers
    )

    assert response.status_code == 422
    if fragment:
        assert fragment in response.json()["detail"]


def test_discount_larger_than_subtotal_makes_total_zero(
    client: TestClient, booking: Booking, headers: dict[str, str]
) -> None:
    draft = create(client, booking, headers)

    body = client.put(
        f"{ADMIN}/proposals/{draft['id']}",
        json=edit_body(discount="9999.00", deposit="0"),
        headers=headers,
    ).json()

    assert body["total"] == "0.00"


# ---------------------------------------------------------------- Sending


def test_sending_locks_the_proposal_and_emails_the_customer(
    client: TestClient,
    db: Session,
    booking: Booking,
    headers: dict[str, str],
    email_sender: FakeEmailSender,
) -> None:
    proposal = sent_proposal(client, booking, headers)

    assert proposal["status"] == "sent"
    assert proposal["sent_at"] is not None
    [email] = email_sender.sent
    assert email.to_address == "jordan@example.com"
    assert proposal["public_url"] in email.html
    assert "$500.00" in email.text
    assert "Extra flavor x 2" in email.text
    [log] = logs(db)
    assert (log.template, log.proposal_id) == (EmailTemplate.PROPOSAL_SENT, proposal["id"])

    edit = client.put(f"{ADMIN}/proposals/{proposal['id']}", json=edit_body(), headers=headers)
    resend = client.post(f"{ADMIN}/proposals/{proposal['id']}/send", headers=headers)
    delete = client.delete(f"{ADMIN}/proposals/{proposal['id']}", headers=headers)
    assert (edit.status_code, resend.status_code, delete.status_code) == (422, 422, 422)


@pytest.mark.parametrize(
    ("body", "booking_status", "fragment"),
    [
        (edit_body(items=[], discount="0", deposit="0"), BookingStatus.PENDING, "line item"),
        (
            edit_body(
                items=[{"description": "Free", "quantity": 1, "unit_price": "0"}],
                discount="0",
                deposit="0",
            ),
            BookingStatus.PENDING,
            "more than $0",
        ),
        (
            edit_body(valid_until=(FIXED_TODAY - timedelta(days=1)).isoformat()),
            BookingStatus.PENDING,
            "valid until",
        ),
        (edit_body(), BookingStatus.DECLINED, "declined booking"),
    ],
    ids=["no items", "zero total", "past expiry", "closed booking"],
)
def test_send_preconditions(
    client: TestClient,
    db: Session,
    booking: Booking,
    headers: dict[str, str],
    email_sender: FakeEmailSender,
    body: dict[str, Any],
    booking_status: BookingStatus,
    fragment: str,
) -> None:
    draft = create(client, booking, headers)
    client.put(f"{ADMIN}/proposals/{draft['id']}", json=body, headers=headers)
    booking.status = booking_status
    db.flush()

    response = client.post(f"{ADMIN}/proposals/{draft['id']}/send", headers=headers)

    assert response.status_code == 422
    assert fragment in response.json()["detail"]
    assert email_sender.sent == []


# ---------------------------------------------------------------- Duplicate, delete, list


def test_duplicate_makes_an_editable_copy(
    client: TestClient, booking: Booking, headers: dict[str, str]
) -> None:
    proposal = sent_proposal(client, booking, headers)

    response = client.post(f"{ADMIN}/proposals/{proposal['id']}/duplicate", headers=headers)

    copy = response.json()
    assert response.status_code == 201
    assert copy["status"] == "draft"
    assert copy["id"] != proposal["id"]
    assert token_of(copy) != token_of(proposal)
    assert copy["items"] == proposal["items"]
    assert copy["total"] == proposal["total"]
    assert copy["sent_at"] is None


def test_only_drafts_can_be_deleted(
    client: TestClient, booking: Booking, headers: dict[str, str]
) -> None:
    draft = create(client, booking, headers)

    assert client.delete(f"{ADMIN}/proposals/{draft['id']}", headers=headers).status_code == 204
    assert client.get(f"{ADMIN}/proposals/{draft['id']}", headers=headers).status_code == 404


def test_list_is_newest_first(
    client: TestClient, booking: Booking, headers: dict[str, str]
) -> None:
    first = create(client, booking, headers)
    second = create(client, booking, headers)

    body = client.get(f"{ADMIN}/bookings/{booking.id}/proposals", headers=headers).json()

    assert [proposal["id"] for proposal in body] == [second["id"], first["id"]]
    assert client.get(f"{ADMIN}/bookings/999999/proposals", headers=headers).status_code == 404


def test_list_query_count_is_constant(
    client: TestClient, booking: Booking, headers: dict[str, str], query_counter: QueryCounter
) -> None:
    url = f"{ADMIN}/bookings/{booking.id}/proposals"
    create(client, booking, headers)
    with query_counter.measure() as queries_for_one:
        client.get(url, headers=headers)

    for _ in range(4):
        draft = create(client, booking, headers)
        client.put(f"{ADMIN}/proposals/{draft['id']}", json=edit_body(), headers=headers)
    with query_counter.measure() as queries_for_many:
        client.get(url, headers=headers)

    assert queries_for_many() == queries_for_one()


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/bookings/1/proposals"),
        ("post", "/bookings/1/proposals"),
        ("get", "/proposals/1"),
        ("put", "/proposals/1"),
        ("post", "/proposals/1/send"),
        ("post", "/proposals/1/duplicate"),
        ("delete", "/proposals/1"),
    ],
)
def test_admin_endpoints_require_an_admin(client: TestClient, method: str, path: str) -> None:
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    try:
        signed_out = client.request(method, f"{ADMIN}{path}", json={})
        not_admin = client.request(
            method, f"{ADMIN}{path}", json={}, headers={"Authorization": f"Bearer {uuid.uuid4()}"}
        )
    finally:
        app.dependency_overrides.pop(get_token_verifier, None)

    assert (signed_out.status_code, not_admin.status_code) == (401, 403)


# ---------------------------------------------------------------- Customer link


def test_public_view_records_the_first_view_only(
    client: TestClient, db: Session, booking: Booking, headers: dict[str, str]
) -> None:
    token = token_of(sent_proposal(client, booking, headers))

    first = client.get(f"{PUBLIC}/{token}")
    viewed_at = db.scalars(select(Proposal.viewed_at)).one()
    client.get(f"{PUBLIC}/{token}")

    body = first.json()
    assert first.status_code == 200
    assert viewed_at is not None
    assert db.scalars(select(Proposal.viewed_at)).one() == viewed_at
    assert set(body) == {
        "business",
        "customer_first_name",
        "event",
        "items",
        "message",
        "status",
        "valid_until",
        "is_expired",
        "responded_at",
        "decline_reason",
        "subtotal",
        "discount",
        "total",
        "deposit",
        "balance",
    }
    assert body["customer_first_name"] == "Jordan"
    assert body["event"]["reference"] == booking.reference
    assert body["business"]["name"]
    assert "customer_email" not in body["event"]


def test_unknown_or_draft_token_is_not_found(
    client: TestClient, booking: Booking, headers: dict[str, str]
) -> None:
    draft = create(client, booking, headers)

    assert client.get(f"{PUBLIC}/not-a-real-token").status_code == 404
    assert client.get(f"{PUBLIC}/{token_of(draft)}").status_code == 404


def test_accepting_approves_the_booking_and_notifies_the_business(
    client: TestClient,
    db: Session,
    booking: Booking,
    headers: dict[str, str],
    email_sender: FakeEmailSender,
) -> None:
    token = token_of(sent_proposal(client, booking, headers))

    response = client.post(f"{PUBLIC}/{token}/accept")

    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert response.json()["responded_at"] is not None
    db.refresh(booking)
    assert booking.status is BookingStatus.APPROVED
    templates = [log.template for log in logs(db)]
    # No separate "approved" email: the acceptance covers it.
    assert templates == [EmailTemplate.PROPOSAL_SENT, EmailTemplate.PROPOSAL_RESPONSE]
    business_email = email_sender.sent[-1]
    assert "accepted the proposal" in business_email.subject

    again = client.post(f"{PUBLIC}/{token}/accept")
    assert again.status_code == 422


def test_declining_keeps_the_reason(
    client: TestClient,
    db: Session,
    booking: Booking,
    headers: dict[str, str],
    email_sender: FakeEmailSender,
) -> None:
    token = token_of(sent_proposal(client, booking, headers))

    response = client.post(f"{PUBLIC}/{token}/decline", json={"reason": "  Over budget  "})

    assert response.json()["status"] == "declined"
    assert response.json()["decline_reason"] == "Over budget"
    db.refresh(booking)
    assert booking.status is BookingStatus.PENDING
    assert "Over budget" in email_sender.sent[-1].text


def test_expired_proposal_cannot_be_answered(
    client: TestClient, db: Session, booking: Booking, headers: dict[str, str]
) -> None:
    token = token_of(sent_proposal(client, booking, headers))
    proposal = db.scalars(select(Proposal)).one()
    proposal.valid_until = FIXED_TODAY - timedelta(days=1)
    db.flush()

    view = client.get(f"{PUBLIC}/{token}").json()
    response = client.post(f"{PUBLIC}/{token}/accept")

    assert view["is_expired"] is True
    assert response.status_code == 422
    assert "expired" in response.json()["detail"]


def test_closed_booking_cannot_accept(
    client: TestClient, db: Session, booking: Booking, headers: dict[str, str]
) -> None:
    token = token_of(sent_proposal(client, booking, headers))
    booking.status = BookingStatus.CANCELLED
    db.flush()

    response = client.post(f"{PUBLIC}/{token}/accept")

    assert response.status_code == 422
    assert "no longer open" in response.json()["detail"]


def test_accepting_for_an_approved_booking_keeps_it_approved(
    client: TestClient, db: Session, booking: Booking, headers: dict[str, str]
) -> None:
    booking.status = BookingStatus.APPROVED
    db.flush()
    token = token_of(sent_proposal(client, booking, headers))

    assert client.post(f"{PUBLIC}/{token}/accept").status_code == 200
    db.refresh(booking)
    assert booking.status is BookingStatus.APPROVED
