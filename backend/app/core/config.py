from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "Popcorn Cart CMS"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"

    # Supabase Postgres connection string (Project Settings -> Database -> Connection string).
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/postgres"

    cors_origins: list[str] = ["http://localhost:5173"]

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, v: str) -> str:
        # Supabase hands out plain postgres:// / postgresql:// URLs; SQLAlchemy needs the driver.
        for prefix in ("postgres://", "postgresql://"):
            if v.startswith(prefix):
                return "postgresql+psycopg://" + v.removeprefix(prefix)
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
