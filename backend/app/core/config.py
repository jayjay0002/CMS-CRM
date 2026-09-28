from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

PSYCOPG_URL_PREFIX = "postgresql+psycopg://"
PLAIN_POSTGRES_PREFIXES = ("postgres://", "postgresql://")


def to_psycopg_url(url: str) -> str:
    # Supabase hands out plain postgres:// / postgresql:// URLs; SQLAlchemy needs the driver.
    for prefix in PLAIN_POSTGRES_PREFIXES:
        if url.startswith(prefix):
            return PSYCOPG_URL_PREFIX + url.removeprefix(prefix)
    return url


ORIGIN_WRAPPING_CHARS = " \"'"


def parse_origins(value: str | list[str]) -> list[str]:
    # Hosting dashboards make a JSON list easy to get wrong, so brackets and quotes are optional:
    # a plain URL, comma-separated URLs or a (loose) JSON list all work. Browsers send origins
    # without a trailing slash, so one here would never match.
    if isinstance(value, str):
        value = value.strip().removeprefix("[").removesuffix("]").split(",")
    origins = (origin.strip(ORIGIN_WRAPPING_CHARS).rstrip("/") for origin in value)
    return [origin for origin in origins if origin]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "The Red Popcorn Wagon"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"

    # Supabase Postgres connection string (Connect -> Session pooler).
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/postgres"

    # Optional. When unset, tests start a throwaway embedded Postgres (pgserver).
    test_database_url: str | None = None

    # The business is in Atlanta, GA; "today" for booking rules is computed here.
    business_timezone: str = "America/New_York"

    # JSON list, or plain URLs separated by commas.
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    # Public URL of the frontend; invite and password links point here.
    frontend_url: str = "http://localhost:5173"

    # Supabase Auth (admin sign-in). Project Settings -> Data API / API Keys.
    supabase_url: str | None = None
    # sb_secret_... key. Server-only: creates admin accounts through the Auth admin API.
    supabase_secret_key: str | None = None
    supabase_jwt_audience: str = "authenticated"

    # Customer emails (Resend). Without an API key, emails are logged as "skipped", not sent.
    resend_api_key: str | None = None
    # Resend's onboarding sender only delivers to the Resend account owner; set a verified
    # domain address (e.g. bookings@theredpopcornwagon.com) to email real customers.
    email_from: str = "The Red Popcorn Wagon <onboarding@resend.dev>"
    email_reply_to: str | None = None
    # When set, every email goes here instead of the real recipient (for testing).
    email_test_recipient: str | None = None

    @field_validator("database_url", "test_database_url")
    @classmethod
    def use_psycopg_driver(cls, value: str | None) -> str | None:
        return to_psycopg_url(value) if value else value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def normalize_origins(cls, value: str | list[str]) -> list[str]:
        return parse_origins(value)

    @field_validator("supabase_url")
    @classmethod
    def strip_trailing_slash(cls, value: str | None) -> str | None:
        return value.rstrip("/") if value else value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
