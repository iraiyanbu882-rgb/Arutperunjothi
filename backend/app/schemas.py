import re
from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, ValidationInfo, field_validator, model_validator

MEMBERSHIP_INTERESTS = (
    "Food & Meal Services",
    "Educational Support & Scholarships",
    "Books & Educational Materials",
    "Publications & Knowledge Activities",
    "Support for Orphanages",
    "Support for Old-Age Homes",
    "Disaster Relief",
    "Medical Camps",
    "Community Welfare & Public Utility",
    "Other Charitable Activities",
)


class MembershipApplicationRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    father_spouse_name: str | None = Field(default=None, max_length=150)
    date_of_birth: date
    gender: Literal["Male", "Female", "Other"]
    occupation: str | None = Field(default=None, max_length=120)
    mobile: str = Field(min_length=7, max_length=20)
    email: EmailStr | None = None
    residential_address: str = Field(min_length=1, max_length=500)
    city_town: str = Field(min_length=1, max_length=100)
    district: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pin_code: str = Field(min_length=4, max_length=10)
    interests: list[str] = Field(min_length=1, max_length=len(MEMBERSHIP_INTERESTS))
    other_charitable_activity: str | None = Field(default=None, max_length=300)

    @field_validator(
        "full_name",
        "father_spouse_name",
        "occupation",
        "residential_address",
        "city_town",
        "district",
        "state",
        "other_charitable_activity",
    )
    @classmethod
    def clean_text(cls, value: str | None, info: ValidationInfo) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.split())
        if not cleaned:
            if info.field_name in {"full_name", "residential_address", "city_town", "district", "state"}:
                raise ValueError("This field is required.")
            return None
        return cleaned or None

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date) -> date:
        if value >= datetime.now(timezone.utc).date():
            raise ValueError("Date of birth must be in the past.")
        return value

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not re.fullmatch(r"\+?[\d][\d\s()-]{5,18}[\d]", cleaned):
            raise ValueError("Enter a valid mobile number.")
        if sum(character.isdigit() for character in cleaned) < 7:
            raise ValueError("Enter a valid mobile number.")
        return cleaned

    @field_validator("email", mode="before")
    @classmethod
    def normalize_optional_email(cls, value: object) -> object:
        if value == "":
            return None
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr | None) -> str | None:
        return str(value).lower() if value is not None else None

    @field_validator("pin_code")
    @classmethod
    def validate_pin_code(cls, value: str) -> str:
        if not re.fullmatch(r"\d{4,10}", value):
            raise ValueError("Enter a valid PIN code.")
        return value

    @field_validator("interests")
    @classmethod
    def validate_interests(cls, values: list[str]) -> list[str]:
        if len(values) != len(set(values)) or any(value not in MEMBERSHIP_INTERESTS for value in values):
            raise ValueError("Select valid areas of interest.")
        return values

    @model_validator(mode="after")
    def require_other_activity(self) -> "MembershipApplicationRequest":
        if "Other Charitable Activities" in self.interests and not self.other_charitable_activity:
            raise ValueError("Describe the other charitable activity.")
        return self


class MembershipApplicationResponse(BaseModel):
    membership_id: str
    date_received: date
    full_name: str
    interests: list[str]
    approval_status: Literal["APPROVED"]


class VolunteerApplicationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    age: int = Field(ge=1, le=120)
    address: str = Field(min_length=1, max_length=500)
    role_on_trust: str = Field(min_length=1, max_length=200)
    available_date: date

    @field_validator("name", "address", "role_on_trust")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned or any(ord(character) < 32 for character in cleaned):
            raise ValueError("This field must contain valid text.")
        return cleaned


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
