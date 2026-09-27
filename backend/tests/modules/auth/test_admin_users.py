import json
import uuid
from collections.abc import Iterator
from datetime import UTC, datetime

import httpx2
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError
from app.main import app
from app.modules.auth.enums import AdminRole
from app.modules.auth.models import AdminUser
from app.modules.auth.schemas import AdminUpdate
from app.modules.auth.service import CANNOT_CHANGE_SELF, MUST_KEEP_AN_OWNER, update_admin
from app.modules.auth.supabase import SupabaseAdminClient, get_admin_client, get_token_verifier
from tests.factories import make_admin

USERS_URL = "/api/v1/admin/users"
FAKE_LINK = "https://test-project.supabase.co/auth/v1/verify?token=abc&type=invite"


class FakeVerifier:
    """Accepts a token that is just the Supabase user id."""

    def verify(self, token: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(token)
        except ValueError:
            return None


class FakeSupabase:
    """Records Auth admin API calls and answers like Supabase would."""

    def __init__(self) -> None:
        self.requests: list[httpx2.Request] = []
        self.signed_in: set[str] = set()
        self.created_user_id = uuid.uuid4()

    def handle(self, request: httpx2.Request) -> httpx2.Response:
        self.requests.append(request)
        if request.url.path.endswith("/generate_link"):
            return httpx2.Response(
                httpx2.codes.OK, json={"id": str(self.created_user_id), "action_link": FAKE_LINK}
            )
        now = datetime.now(UTC).isoformat()
        users = [{"id": user_id, "last_sign_in_at": now} for user_id in self.signed_in]
        return httpx2.Response(httpx2.codes.OK, json={"users": users})

    def client(self) -> SupabaseAdminClient:
        http = httpx2.Client(transport=httpx2.MockTransport(self.handle))
        return SupabaseAdminClient("https://test-project.supabase.co", "sb_secret_test", http)

    def generate_link_bodies(self) -> list[dict]:
        return [
            json.loads(r.content) for r in self.requests if r.url.path.endswith("/generate_link")
        ]


@pytest.fixture
def supabase() -> Iterator[FakeSupabase]:
    fake = FakeSupabase()
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    app.dependency_overrides[get_admin_client] = fake.client
    yield fake
    app.dependency_overrides.pop(get_token_verifier, None)
    app.dependency_overrides.pop(get_admin_client, None)


def as_admin(admin: AdminUser) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin.auth_user_id}"}


@pytest.fixture
def owner(db: Session) -> AdminUser:
    return make_admin(db, email="owner@example.com", full_name="Pat Owner", role=AdminRole.OWNER)


# ---------------------------------------------------------------- Access


@pytest.mark.parametrize(
    ("method", "path"),
    [("get", ""), ("post", ""), ("patch", "/1"), ("post", "/1/sign-in-link")],
)
def test_staff_cannot_manage_admins(
    client: TestClient, db: Session, supabase: FakeSupabase, method: str, path: str
) -> None:
    staff = make_admin(db, role=AdminRole.STAFF)

    response = client.request(method, f"{USERS_URL}{path}", json={}, headers=as_admin(staff))

    assert response.status_code == 403


# ---------------------------------------------------------------- Invite


def test_owner_invites_an_admin_and_gets_a_link(
    client: TestClient, owner: AdminUser, supabase: FakeSupabase
) -> None:
    response = client.post(
        USERS_URL,
        json={"email": " Client@Example.com ", "full_name": " Jamie Client ", "role": "owner"},
        headers=as_admin(owner),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["invite_link"] == FAKE_LINK
    assert body["admin"]["email"] == "client@example.com"
    assert body["admin"]["full_name"] == "Jamie Client"
    assert body["admin"]["role"] == "owner"
    assert body["admin"]["status"] == "invited"
    [link_request] = supabase.generate_link_bodies()
    assert link_request == {
        "type": "invite",
        "email": "client@example.com",
        "redirect_to": "http://localhost:5173/admin/reset-password",
    }


def test_inviting_an_existing_admin_is_a_conflict(
    client: TestClient, owner: AdminUser, supabase: FakeSupabase
) -> None:
    response = client.post(
        USERS_URL,
        json={"email": "OWNER@example.com", "full_name": "Again", "role": "staff"},
        headers=as_admin(owner),
    )

    assert response.status_code == 409
    assert supabase.generate_link_bodies() == []


# ---------------------------------------------------------------- List and status


def test_list_shows_status_from_supabase_in_one_request(
    client: TestClient, db: Session, owner: AdminUser, supabase: FakeSupabase
) -> None:
    invited = make_admin(db, full_name="New Person")
    make_admin(db, full_name="Gone", is_active=False)
    supabase.signed_in = {str(owner.auth_user_id)}

    response = client.get(USERS_URL, headers=as_admin(owner))

    assert response.status_code == 200
    statuses = {row["full_name"]: row["status"] for row in response.json()}
    assert statuses == {"Pat Owner": "active", "New Person": "invited", "Gone": "deactivated"}
    assert invited.id in {row["id"] for row in response.json()}
    list_calls = [r for r in supabase.requests if r.method == "GET"]
    assert len(list_calls) == 1


def test_sign_in_link_is_invite_before_first_sign_in_and_recovery_after(
    client: TestClient, db: Session, owner: AdminUser, supabase: FakeSupabase
) -> None:
    staff = make_admin(db, role=AdminRole.STAFF)
    url = f"{USERS_URL}/{staff.id}/sign-in-link"

    client.post(url, headers=as_admin(owner))
    supabase.signed_in = {str(staff.auth_user_id)}
    client.post(url, headers=as_admin(owner))

    assert [body["type"] for body in supabase.generate_link_bodies()] == ["invite", "recovery"]


# ---------------------------------------------------------------- Role and access changes


def test_owner_changes_role_and_deactivates(
    client: TestClient, db: Session, owner: AdminUser, supabase: FakeSupabase
) -> None:
    staff = make_admin(db, role=AdminRole.STAFF)

    promoted = client.patch(
        f"{USERS_URL}/{staff.id}", json={"role": "owner"}, headers=as_admin(owner)
    )
    deactivated = client.patch(
        f"{USERS_URL}/{staff.id}", json={"is_active": False}, headers=as_admin(owner)
    )

    assert promoted.json()["role"] == "owner"
    assert deactivated.json()["status"] == "deactivated"
    # Deactivation takes effect immediately.
    me = client.get("/api/v1/admin/auth/me", headers=as_admin(staff))
    assert me.status_code == 403


def test_owner_cannot_change_themselves(
    client: TestClient, owner: AdminUser, supabase: FakeSupabase
) -> None:
    response = client.patch(
        f"{USERS_URL}/{owner.id}", json={"role": "staff"}, headers=as_admin(owner)
    )

    assert response.status_code == 422
    assert response.json()["detail"] == CANNOT_CHANGE_SELF


def test_unknown_admin_is_not_found(
    client: TestClient, owner: AdminUser, supabase: FakeSupabase
) -> None:
    response = client.patch(f"{USERS_URL}/999999", json={"role": "staff"}, headers=as_admin(owner))

    assert response.status_code == 404


def test_update_rejects_unknown_fields(
    client: TestClient, db: Session, owner: AdminUser, supabase: FakeSupabase
) -> None:
    staff = make_admin(db)

    response = client.patch(
        f"{USERS_URL}/{staff.id}", json={"email": "x@example.com"}, headers=as_admin(owner)
    )

    assert response.status_code == 422


def test_last_owner_rule(db: Session) -> None:
    """The only active owner can't be demoted or deactivated; with two owners it's fine."""
    only_owner = make_admin(db, role=AdminRole.OWNER)
    staff = make_admin(db, role=AdminRole.STAFF)

    for change in (AdminUpdate(role=AdminRole.STAFF), AdminUpdate(is_active=False)):
        with pytest.raises(BusinessRuleError, match=MUST_KEEP_AN_OWNER):
            update_admin(db, staff, only_owner.id, change)

    second_owner = make_admin(db, role=AdminRole.OWNER)
    demoted = update_admin(db, second_owner, only_owner.id, AdminUpdate(role=AdminRole.STAFF))
    assert demoted.role is AdminRole.STAFF
