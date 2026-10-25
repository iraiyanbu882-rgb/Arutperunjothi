import base64
import hashlib
import hmac
from http.cookies import SimpleCookie
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi import HTTPException, Request, Response
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings
from app.database import Base
from app.main import (
    _verified_paid_order,
    auth_me,
    auth_signin,
    auth_signout,
    auth_signup,
    google_auth_start,
    public_config,
    require_donations_enabled,
    require_trusted_origin,
    verify_webhook_signature,
)
from app.models import Donation, User
from app.schemas import DonationOrderRequest, SignInRequest, SignUpRequest
from pydantic import ValidationError


@pytest.fixture
def auth_db():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=test_engine)
    test_session = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)
    settings = Settings(
        _env_file=None,
        frontend_url="http://localhost:5173",
        public_base_url="http://localhost:8000",
        cors_origins="http://localhost:5173",
    )
    try:
        yield test_session, settings
    finally:
        test_engine.dispose()


def make_request(method: str = "POST", *, origin: str | None = None, cookie: str | None = None) -> Request:
    headers = []
    if origin:
        headers.append((b"origin", origin.encode("ascii")))
    if cookie:
        headers.append((b"cookie", cookie.encode("ascii")))
    return Request(
        {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": method,
            "scheme": "http",
            "path": "/",
            "raw_path": b"/",
            "query_string": b"",
            "headers": headers,
            "client": ("testclient", 1234),
            "server": ("testserver", 80),
        }
    )


def auth_cookie(response: Response) -> str:
    cookies = SimpleCookie()
    cookies.load(response.headers["set-cookie"])
    return cookies["arut_session"].value


def test_webhook_signature_matches_cashfree_raw_body_scheme():
    body = b'{"type":"PAYMENT_SUCCESS_WEBHOOK","data":{"order":{"order_id":"apt_test"}}}'
    timestamp = "1785401067911"
    secret = "sandbox-secret"
    digest = hmac.new(secret.encode(), timestamp.encode() + body, hashlib.sha256).digest()
    signature = base64.b64encode(digest).decode()

    assert verify_webhook_signature(body, timestamp, signature, secret)
    assert not verify_webhook_signature(body + b" ", timestamp, signature, secret)


def test_order_confirmation_requires_matching_paid_inr_amount():
    donation = Donation(
        order_id="apt_test",
        idempotency_key="00000000-0000-0000-0000-000000000000",
        amount_paise=25000,
        donor_name="Test Donor",
        donor_email="donor@example.com",
        donor_phone="9876543210",
        status="PENDING",
    )
    order = {
        "order_id": "apt_test",
        "order_status": "PAID",
        "order_currency": "INR",
        "order_amount": 250,
    }

    assert _verified_paid_order(order, donation)
    assert not _verified_paid_order({**order, "order_amount": 251}, donation)
    assert not _verified_paid_order({**order, "order_status": "ACTIVE"}, donation)
    assert not _verified_paid_order({**order, "order_currency": "USD"}, donation)


def test_donation_request_rejects_invalid_amount_and_phone():
    try:
        DonationOrderRequest(amount=99, name="Donor", email="donor@example.com", phone="9876543210")
    except ValidationError:
        pass
    else:
        raise AssertionError("amount below minimum should be rejected")

    try:
        DonationOrderRequest(amount=250, name="Donor", email="donor@example.com", phone="1234567890")
    except ValidationError:
        pass
    else:
        raise AssertionError("invalid Indian phone should be rejected")


def test_live_donations_require_explicit_gate_and_https():
    base = {
        "cashfree_client_id": "id",
        "cashfree_client_secret": "secret",
        "cashfree_env": "production",
        "donations_enabled": True,
        "enable_live_donations": True,
    }

    assert not Settings(**base, public_base_url="http://example.org").can_accept_donations
    assert not Settings(**base, public_base_url="https://api.example.org").can_accept_donations
    assert Settings(
        **base,
        public_base_url="https://api.example.org",
        frontend_url="https://example.org",
        live_donation_compliance_confirmed=True,
    ).can_accept_donations
    assert Settings(
        _env_file=None,
        frontend_url="https://example.org",
        public_base_url="https://api.example.org",
    ).auth_cookie_samesite == "none"


def test_donation_order_is_disabled_without_explicit_configuration():
    settings = Settings(_env_file=None)
    with pytest.raises(HTTPException) as error:
        require_donations_enabled(settings)

    assert error.value.status_code == 503
    assert error.value.detail == "Donations are not enabled."


def test_signup_signin_and_signout_use_secure_server_session(auth_db):
    session_factory, settings = auth_db
    with session_factory() as db:
        signup_response = Response()
        user_data = auth_signup(
            SignUpRequest(
                name="  Test   Donor ",
                email="DONOR@example.com",
                password="a-long-test-password-123",
            ),
            make_request(origin="http://localhost:5173"),
            signup_response,
            db,
            settings,
        )

        assert user_data.name == "Test Donor"
        assert user_data.email == "donor@example.com"
        assert "httponly" in signup_response.headers["set-cookie"].lower()
        cookie = auth_cookie(signup_response)
        user = db.scalar(select(User).where(User.email == "donor@example.com"))
        assert user is not None
        assert user.password_hash != "a-long-test-password-123"
        assert user.password_hash.startswith("scrypt$")
        assert auth_me(make_request("GET", cookie=f"arut_session={cookie}"), db).email == "donor@example.com"

        signin_response = Response()
        signin_user = auth_signin(
            SignInRequest(email="donor@example.com", password="a-long-test-password-123"),
            make_request(origin="http://localhost:5173"),
            signin_response,
            db,
            settings,
        )
        assert signin_user.email == "donor@example.com"
        signin_cookie = auth_cookie(signin_response)

        signout_response = Response()
        auth_signout(
            make_request(origin="http://localhost:5173", cookie=f"arut_session={signin_cookie}"),
            signout_response,
            db,
            settings,
        )
        with pytest.raises(HTTPException) as error:
            auth_me(make_request("GET", cookie=f"arut_session={signin_cookie}"), db)
        assert error.value.status_code == 401


def test_signin_does_not_disclose_unknown_email(auth_db):
    session_factory, settings = auth_db
    with session_factory() as db, pytest.raises(HTTPException) as error:
        auth_signin(
            SignInRequest(email="unknown@example.com", password="a-long-test-password-123"),
            make_request(origin="http://localhost:5173"),
            Response(),
            db,
            settings,
        )

    assert error.value.status_code == 401
    assert error.value.detail == "Email or password is incorrect."


def test_google_signin_requires_server_credentials(auth_db):
    session_factory, settings = auth_db
    with session_factory() as db, pytest.raises(HTTPException) as error:
        google_auth_start(db, settings)

    assert error.value.status_code == 503
    assert error.value.detail == "Google sign-in is not configured."


def test_google_signin_start_uses_state_and_pkce(auth_db):
    session_factory, _ = auth_db
    settings = Settings(
        _env_file=None,
        google_client_id="google-client-id",
        google_client_secret="google-client-secret",
        public_base_url="https://api.example.org",
    )
    with session_factory() as db:
        redirect = google_auth_start(db, settings)
        values = parse_qs(urlparse(redirect.headers["location"]).query)

        assert urlparse(redirect.headers["location"]).netloc == "accounts.google.com"
        assert values["redirect_uri"] == ["https://api.example.org/api/auth/google/callback"]
        assert values["code_challenge_method"] == ["S256"]
        assert values["scope"] == ["openid email profile"]
        assert values["state"][0]
        assert "httponly" in redirect.headers["set-cookie"].lower()


def test_google_callback_url_is_exposed_for_console_configuration(auth_db):
    _, settings = auth_db

    config = public_config(settings)

    assert config.google_redirect_uri == "http://localhost:8000/api/auth/google/callback"


def test_auth_mutations_reject_untrusted_origin(auth_db):
    _, settings = auth_db
    with pytest.raises(HTTPException) as error:
        require_trusted_origin(make_request(origin="https://attacker.example"), settings)

    assert error.value.status_code == 403
