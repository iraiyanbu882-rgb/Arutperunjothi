import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class DonationOrderRequest(BaseModel):
    amount: int = Field(ge=100, le=1_000_000)
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=10)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned or any(ord(character) < 32 for character in cleaned):
            raise ValueError("Enter a valid name")
        return cleaned

    @field_validator("phone")
    @classmethod
    def validate_indian_phone(cls, value: str) -> str:
        if not re.fullmatch(r"[6-9]\d{9}", value):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class DonationOrderResponse(BaseModel):
    order_id: str
    payment_session_id: str
    payment_mode: str


class DonationStatusResponse(BaseModel):
    order_id: str
    status: str
    amount: int
    currency: str = "INR"


class PublicConfigResponse(BaseModel):
    donations_enabled: bool
    payment_mode: str
    google_sign_in_enabled: bool
    google_redirect_uri: str

    model_config = ConfigDict(extra="forbid")


class SignUpRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned or any(ord(character) < 32 for character in cleaned):
            raise ValueError("Enter a valid name")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
