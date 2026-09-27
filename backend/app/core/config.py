from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PSYCOPG_URL_PREFIX = "postgresql+psycopg://"
PLAIN_POSTGRES_PREFIXES = ("postgres://", "postgresql://")


def to_psycopg_url(url: str) -> str:
    # Supabase hands out plain postgres:// / postgresql:// URLs; SQLAlchemy needs the driver.
    for prefix in PLAIN_POSTGRES_PREFIXES:
        if url.startswith(prefix):
            return PSYCOPG_URL_PREFIX + url.removeprefix(prefix)
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "Popcorn Cart CMS"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"

    # Supabase Postgres connection string (Project Settings -> Database -> Connection string).
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/postgres"

    # Optional. When unset, tests start a throwaway embedded Postgres (pgserver).
    test_database_url: str | None = None

    # The business is in Atlanta, GA; "today" for booking rules is computed here.
    business_timezone: str = "America/New_York"

    cors_origins: list[str] = ["http://localhost:5173"]

    @field_validator("database_url", "test_database_url")
    @classmethod
    def use_psycopg_driver(cls, value: str | None) -> str | None:
        return to_psycopg_url(value) if value else value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
