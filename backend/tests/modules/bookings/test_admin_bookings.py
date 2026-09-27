import uuid
from collections.abc import Iterator
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.enums import AdminRole
from app.modules.auth.supabase import get_token_verifier
from app.modules.bookings.enums import BookingStatus
from app.modules.packages.models import Package
from tests.conftest import FIXED_TODAY
from tests.factories import make_admin, make_booking, make_package
from tests.query_counter import QueryCounter

URL = "/api/v1/admin/bookings"


class FakeVerifier:
    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


@pytest.fixture
def package(db: Session) -> Package:
    return make_package(db, name="The Party Pop")


@pytest.fixture
def staff_headers(db: Session) -> Iterator[dict[str, str]]:
    staff = make_admin(db, role=AdminRole.STAFF)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    yield {"Authorization": f"Bearer {staff.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)


def refs(response_json: dict) -> list[str]:
    return [item["reference"] for item in response_json["items"]]


# ---------------------------------------------------------------- Access


@pytest.mark.parametrize(
    ("method", "path"),
    [("get", ""), ("get", "/summary"), ("get", "/1"), ("post", "/1/status"), ("patch", "/1")],
)
def test_admin_booking_endpoints_require_sign_in(
    client: TestClient, method: str, path: str
) -> None:
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    try:
        response = client.request(method, f"{URL}{path}", json={})
    finally:
        app.dependency_overrides.pop(get_token_verifier, None)

    assert response.status_code == 401


def test_signed_in_non_admin_is_forbidden(client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    try:
        response = client.get(URL, headers={"Authorization": f"Bearer {uuid.uuid4()}"})
    finally:
        app.dependency_overrides.pop(get_token_verifier, None)

    assert response.status_code == 403


# ---------------------------------------------------------------- List


def test_upcoming_is_the_default_and_soonest_first(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    make_booking(db, package, reference="PC-LATER", event_date=FIXED_TODAY + timedelta(days=9))
    make_booking(db, package, reference="PC-SOON", event_date=FIXED_TODAY + timedelta(days=2))
    make_booking(db, package, reference="PC-TODAY", event_date=FIXED_TODAY)
    make_booking(db, package, reference="PC-PAST", event_date=FIXED_TODAY - timedelta(days=1))

    body = client.get(URL, headers=staff_headers).json()

    assert refs(body) == ["PC-TODAY", "PC-SOON", "PC-LATER"]
    assert (body["total"], body["limit"], body["offset"]) == (3, 20, 0)
    item = body["items"][0]
    assert set(item) == {
        "id",
        "reference",
        "customer_name",
        "package_name",
        "event_date",
        "event_start_time",
        "guest_count",
        "status",
        "created_at",
    }


def test_past_timeframe_is_most_recent_first(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    make_booking(db, package, reference="PC-OLD", event_date=FIXED_TODAY - timedelta(days=30))
    make_booking(db, package, reference="PC-RECENT", event_date=FIXED_TODAY - timedelta(days=1))
    make_booking(db, package, reference="PC-FUTURE", event_date=FIXED_TODAY + timedelta(days=1))

    body = client.get(URL, params={"timeframe": "past"}, headers=staff_headers).json()

    assert refs(body) == ["PC-RECENT", "PC-OLD"]


def test_filter_by_status_and_search(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    make_booking(db, package, reference="PC-AAAAAA", customer_name="Jordan Lee")
    make_booking(
        db,
        package,
        reference="PC-BBBBBB",
        customer_name="Sam Rivers",
        status=BookingStatus.APPROVED,
    )
    make_booking(db, package, reference="PC-CCCCCC", customer_name="Jordan Park")

    approved = client.get(URL, params={"status": "approved"}, headers=staff_headers).json()
    by_name = client.get(URL, params={"q": "jordan"}, headers=staff_headers).json()
    by_ref = client.get(URL, params={"q": "bbbb"}, headers=staff_headers).json()

    assert refs(approved) == ["PC-BBBBBB"]
    assert sorted(refs(by_name)) == ["PC-AAAAAA", "PC-CCCCCC"]
    assert refs(by_ref) == ["PC-BBBBBB"]


def test_search_treats_wildcards_literally(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    make_booking(db, package, customer_name="Ann")

    body = client.get(URL, params={"q": "%"}, headers=staff_headers).json()

    assert body["total"] == 0


def test_pagination(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    for day in range(5):
        make_booking(db, package, event_date=FIXED_TODAY + timedelta(days=day + 1))

    first = client.get(URL, params={"limit": 2}, headers=staff_headers).json()
    last = client.get(URL, params={"limit": 2, "offset": 4}, headers=staff_headers).json()
    too_big = client.get(URL, params={"limit": 101}, headers=staff_headers)

    assert (len(first["items"]), first["total"]) == (2, 5)
    assert len(last["items"]) == 1
    assert too_big.status_code == 422


def test_list_query_count_does_not_grow_with_rows(
    client: TestClient,
    db: Session,
    package: Package,
    staff_headers: dict[str, str],
    query_counter: QueryCounter,
) -> None:
    make_booking(db, package)
    with query_counter.measure() as queries_for_one:
        client.get(URL, headers=staff_headers)

    for _ in range(6):
        make_booking(db, package)
    with query_counter.measure() as queries_for_many:
        client.get(URL, headers=staff_headers)

    assert queries_for_many() == queries_for_one()


def test_summary_counts_pending(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    make_booking(db, package)
    make_booking(db, package)
    make_booking(db, package, status=BookingStatus.APPROVED)

    assert client.get(f"{URL}/summary", headers=staff_headers).json() == {"pending_count": 2}


# ---------------------------------------------------------------- Detail, status, notes


def test_detail_includes_contact_and_next_steps(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    booking = make_booking(db, package, customer_notes="Kettle corn please")

    body = client.get(f"{URL}/{booking.id}", headers=staff_headers).json()

    assert body["customer_email"] == booking.customer_email
    assert body["customer_notes"] == "Kettle corn please"
    assert body["package_price"] == "450.00"
    assert body["allowed_next_statuses"] == ["approved", "declined", "cancelled"]


@pytest.mark.parametrize(
    ("start", "target", "expected_status"),
    [
        (BookingStatus.PENDING, BookingStatus.APPROVED, 200),
        (BookingStatus.PENDING, BookingStatus.DECLINED, 200),
        (BookingStatus.APPROVED, BookingStatus.COMPLETED, 200),
        (BookingStatus.APPROVED, BookingStatus.CANCELLED, 200),
        (BookingStatus.PENDING, BookingStatus.COMPLETED, 422),
        (BookingStatus.DECLINED, BookingStatus.APPROVED, 422),
        (BookingStatus.COMPLETED, BookingStatus.CANCELLED, 422),
        (BookingStatus.APPROVED, BookingStatus.APPROVED, 422),
    ],
)
def test_status_changes_follow_the_rules(
    client: TestClient,
    db: Session,
    package: Package,
    staff_headers: dict[str, str],
    start: BookingStatus,
    target: BookingStatus,
    expected_status: int,
) -> None:
    booking = make_booking(db, package, status=start)
    before = booking.status_changed_at

    response = client.post(
        f"{URL}/{booking.id}/status", json={"status": target.value}, headers=staff_headers
    )

    assert response.status_code == expected_status
    if expected_status == 200:
        assert response.json()["status"] == target.value
        db.refresh(booking)
        assert booking.status_changed_at != before


def test_final_bookings_have_no_next_steps(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    booking = make_booking(db, package, status=BookingStatus.COMPLETED)

    body = client.get(f"{URL}/{booking.id}", headers=staff_headers).json()

    assert body["allowed_next_statuses"] == []


def test_admin_notes_are_saved_and_cleared(
    client: TestClient, db: Session, package: Package, staff_headers: dict[str, str]
) -> None:
    booking = make_booking(db, package)
    url = f"{URL}/{booking.id}"

    saved = client.patch(
        url, json={"admin_notes": "  Called, confirmed parking.  "}, headers=staff_headers
    )
    cleared = client.patch(url, json={"admin_notes": "   "}, headers=staff_headers)

    assert saved.json()["admin_notes"] == "Called, confirmed parking."
    assert cleared.json()["admin_notes"] is None


def test_unknown_booking_is_not_found(client: TestClient, staff_headers: dict[str, str]) -> None:
    assert client.get(f"{URL}/999999", headers=staff_headers).status_code == 404
