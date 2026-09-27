from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    # Supabase's transaction pooler (port 6543) doesn't support prepared statements.
    connect_args={"prepare_threshold": None},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session]:
    with SessionLocal() as db:
        yield db
