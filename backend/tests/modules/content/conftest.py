from collections.abc import Iterator

import pytest
from sqlalchemy.orm import Session

from app.main import app
from app.modules.auth.enums import AdminRole
from app.modules.auth.supabase import get_token_verifier
from app.modules.content.service import seed_defaults
from tests.factories import make_admin
from tests.modules.content.helpers import TEST_SUPABASE_URL, FakeVerifier


@pytest.fixture(autouse=True)
def seeded(db: Session, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.core.config.settings.supabase_url", TEST_SUPABASE_URL)
    seed_defaults(db)


@pytest.fixture
def admin_headers(db: Session) -> Iterator[dict[str, str]]:
    admin = make_admin(db, role=AdminRole.STAFF)
    app.dependency_overrides[get_token_verifier] = FakeVerifier
    yield {"Authorization": f"Bearer {admin.auth_user_id}"}
    app.dependency_overrides.pop(get_token_verifier, None)
