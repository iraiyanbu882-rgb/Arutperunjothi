from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    cashfree_client_id: str = ""
    cashfree_client_secret: str = ""
    cashfree_env: str = "sandbox"
    cashfree_api_version: str = "2026-01-01"
    google_client_id: str = ""
    google_client_secret: str = ""
    donations_enabled: bool = False
    enable_live_donations: bool = False
    live_donation_compliance_confirmed: bool = False
    frontend_url: str = "http://localhost:5173"
    public_base_url: str = "http://localhost:8000"
    database_url: str = "sqlite:///./arutperunjothi.db"
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cashfree_env")
    @classmethod
    def validate_environment(cls, value: str) -> str:
        normalized = value.lower()
        if normalized not in {"sandbox", "production"}:
            raise ValueError("CASHFREE_ENV must be sandbox or production")
        return normalized

    @property
    def api_base_url(self) -> str:
        if self.cashfree_env == "production":
            return "https://api.cashfree.com/pg"
        return "https://sandbox.cashfree.com/pg"

    @property
    def payment_mode(self) -> str:
        return self.cashfree_env

    @property
    def google_sign_in_enabled(self) -> bool:
        return bool(self.google_client_id.strip() and self.google_client_secret.strip())

    @property
    def auth_cookie_secure(self) -> bool:
        return self.public_base_url.startswith("https://")

    @property
    def auth_cookie_samesite(self) -> str:
        if self.auth_cookie_secure and self.frontend_url.startswith("https://"):
            return "none"
        return "lax"

    @property
    def cashfree_ready(self) -> bool:
        return bool(self.cashfree_client_id.strip() and self.cashfree_client_secret.strip())

    @property
    def can_accept_donations(self) -> bool:
        if not self.donations_enabled or not self.cashfree_ready:
            return False
        if self.cashfree_env == "production":
            return (
                self.enable_live_donations
                and self.live_donation_compliance_confirmed
                and self.public_base_url.startswith("https://")
                and self.frontend_url.startswith("https://")
            )
        return True

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
