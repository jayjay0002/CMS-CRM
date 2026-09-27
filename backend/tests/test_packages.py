from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from tests.factories import make_package
from tests.query_counter import QueryCounter

PACKAGES_URL = "/api/v1/packages"


def test_lists_only_active_packages_in_display_order(client: TestClient, db: Session) -> None:
    make_package(db, slug="second", position=2)
    make_package(db, slug="first", position=1)
    make_package(db, slug="hidden", position=0, is_active=False)

    response = client.get(PACKAGES_URL)

    assert response.status_code == 200
    assert [pkg["slug"] for pkg in response.json()] == ["first", "second"]


def test_package_price_is_serialized_as_exact_string(client: TestClient, db: Session) -> None:
    make_package(db, slug="party-pop")

    body = client.get(f"{PACKAGES_URL}/party-pop").json()

    assert body["price"] == "450.00"
    assert body["duration_hours"] == 3


def test_inactive_or_unknown_package_is_not_found(client: TestClient, db: Session) -> None:
    make_package(db, slug="retired", is_active=False)

    assert client.get(f"{PACKAGES_URL}/retired").status_code == 404
    assert client.get(f"{PACKAGES_URL}/nope").status_code == 404


def test_listing_query_count_does_not_grow_with_rows(
    client: TestClient, db: Session, query_counter: QueryCounter
) -> None:
    make_package(db)
    with query_counter.measure() as queries_for_one:
        client.get(PACKAGES_URL)

    for _ in range(5):
        make_package(db)
    with query_counter.measure() as queries_for_many:
        client.get(PACKAGES_URL)

    assert queries_for_many() == queries_for_one()
