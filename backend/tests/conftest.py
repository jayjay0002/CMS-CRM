from collections.abc import Iterator
from datetime import date

import pgserver
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from app.core.clock import business_today
from app.core.config import settings, to_psycopg_url
from app.db.session import get_db
from app.main import app
from app.models import Base
from tests.query_counter import QueryCounter

# A fixed "today" so booking date rules are deterministic.
FIXED_TODAY = date(2026, 10, 1)


@pytest.fixture(scope="session")
def engine(tmp_path_factory: pytest.TempPathFactory) -> Iterator[Engine]:
    url = settings.test_database_url
    if url is None:
        # Throwaway embedded Postgres; never the real (Supabase) database.
        server = pgserver.get_server(tmp_path_factory.mktemp("pgdata"), cleanup_mode="stop")
        url = to_psycopg_url(server.get_uri())

    test_engine = create_engine(url)
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    yield test_engine
    test_engine.dispose()


@pytest.fixture
def db(engine: Engine) -> Iterator[Session]:
    # Each test runs in a transaction that is rolled back, so tests never see each other's rows.
    with engine.connect() as connection:
        transaction = connection.begin()
        session = Session(
            bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False
        )
        yield session
        session.close()
        transaction.rollback()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[business_today] = lambda: FIXED_TODAY
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def query_counter(engine: Engine) -> Iterator[QueryCounter]:
    with QueryCounter.listen(engine) as counter:
        yield counter
