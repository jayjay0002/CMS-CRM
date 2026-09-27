import uuid
from collections.abc import Iterator
from datetime import timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.enums import AdminRole
from app.modules.auth.supabase import get_token_verifier
from app.modules.bookings.models import Booking
from app.modules.packages.models import Package
from app.modules.proposals.enums import ProposalStatus
from app.modules.proposals.models import Proposal, ProposalItem
from tests.conftest import FIXED_TODAY
from tests.factories import make_admin, make_booking, make_package
from tests.query_counter import QueryCounter

URL = "/api/v1/admin/proposals"


class FakeVerifier:
    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


@pytest.fixture
def headers(db: Session) -> Iterator[dict[str, str]]:
    staff = make_admin(db, role=AdminRole.STAFF)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    yield {"Authorization": f"Bearer {staff.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)


@pytest.fixture
def package(db: Session) -> Package:
    return make_package(db, name="The Party Pop")


def make_proposal(
    db: Session,
    booking: Booking,
    status: ProposalStatus = ProposalStatus.DRAFT,
    *,
    valid_days: int = 14,
    unit_price: str = "450.00",
) -> Proposal:
    proposal = Proposal(
        booking_id=booking.id,
        public_token=uuid.uuid4().hex,
        status=status,
        discount=Decimal("0.00"),
        deposit=Decimal("100.00"),
        valid_until=FIXED_TODAY + timedelta(days=valid_days),
        items=[
            ProposalItem(position=0, description="Cart", quantity=1, unit_price=Decimal(unit_price))
        ],
    )
    db.add(proposal)
    db.flush()
    return proposal


def ids(body: dict) -> set[int]:
    return {item["id"] for item in body["items"]}


def test_lists_proposals_across_bookings_with_booking_details(
    client: TestClient, db: Session, package: Package, headers: dict[str, str]
) -> None:
    first = make_booking(db, package, reference="PC-AAAAAA", customer_name="Jordan Lee")
    second = make_booking(db, package, reference="PC-BBBBBB", customer_name="Sam Rivers")
    older = make_proposal(db, first)
    newer = make_proposal(db, second, ProposalStatus.SENT, unit_price="600.00")

    body = client.get(URL, headers=headers).json()

    assert body["total"] == 2
    row = next(item for item in body["items"] if item["id"] == newer.id)
    assert row["booking_reference"] == "PC-BBBBBB"
    assert row["customer_name"] == "Sam Rivers"
    assert (row["total"], row["deposit"], row["status"]) == ("600.00", "100.00", "sent")
    assert older.id in ids(body)


def test_filters_split_sent_into_awaiting_and_expired(
    client: TestClient, db: Session, package: Package, headers: dict[str, str]
) -> None:
    booking = make_booking(db, package)
    draft = make_proposal(db, booking)
    awaiting = make_proposal(db, booking, ProposalStatus.SENT)
    expired = make_proposal(db, booking, ProposalStatus.SENT, valid_days=-1)
    accepted = make_proposal(db, booking, ProposalStatus.ACCEPTED)
    declined = make_proposal(db, booking, ProposalStatus.DECLINED)

    def listed(list_filter: str) -> set[int]:
        return ids(client.get(URL, params={"filter": list_filter}, headers=headers).json())

    assert listed("draft") == {draft.id}
    assert listed("awaiting") == {awaiting.id}
    assert listed("expired") == {expired.id}
    assert listed("accepted") == {accepted.id}
    assert listed("declined") == {declined.id}
    assert len(listed("all")) == 5
    assert client.get(f"{URL}/summary", headers=headers).json() == {"awaiting_count": 1}


def test_search_by_booking_reference_or_customer_name(
    client: TestClient, db: Session, package: Package, headers: dict[str, str]
) -> None:
    jordan = make_proposal(db, make_booking(db, package, customer_name="Jordan Lee"))
    sam = make_proposal(db, make_booking(db, package, reference="PC-SAMSAM"))

    by_name = client.get(URL, params={"q": "jordan"}, headers=headers).json()
    by_ref = client.get(URL, params={"q": "samsam"}, headers=headers).json()
    wildcard = client.get(URL, params={"q": "%"}, headers=headers).json()

    assert ids(by_name) == {jordan.id}
    assert ids(by_ref) == {sam.id}
    assert wildcard["total"] == 0


def test_pagination(
    client: TestClient, db: Session, package: Package, headers: dict[str, str]
) -> None:
    booking = make_booking(db, package)
    for _ in range(3):
        make_proposal(db, booking)

    body = client.get(URL, params={"limit": 2, "offset": 2}, headers=headers).json()

    assert (len(body["items"]), body["total"]) == (1, 3)


def test_list_query_count_does_not_grow_with_rows(
    client: TestClient,
    db: Session,
    package: Package,
    headers: dict[str, str],
    query_counter: QueryCounter,
) -> None:
    make_proposal(db, make_booking(db, package))
    with query_counter.measure() as queries_for_one:
        client.get(URL, headers=headers)

    for _ in range(5):
        make_proposal(db, make_booking(db, package))
    with query_counter.measure() as queries_for_many:
        client.get(URL, headers=headers)

    assert queries_for_many() == queries_for_one()


@pytest.mark.parametrize("path", ["", "/summary"])
def test_requires_an_admin(client: TestClient, path: str) -> None:
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    try:
        signed_out = client.get(f"{URL}{path}")
        not_admin = client.get(f"{URL}{path}", headers={"Authorization": f"Bearer {uuid.uuid4()}"})
    finally:
        app.dependency_overrides.pop(get_token_verifier, None)

    assert (signed_out.status_code, not_admin.status_code) == (401, 403)
