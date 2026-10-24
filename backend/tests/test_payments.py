import base64
import hashlib
import hmac

from fastapi.testclient import TestClient
from app.config import Settings, get_settings
from app.main import _verified_paid_order, app, verify_webhook_signature
from app.models import Donation
from app.schemas import DonationOrderRequest
from pydantic import ValidationError


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


def test_donation_order_is_disabled_without_explicit_configuration():
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None)
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/donations/orders",
                headers={"Idempotency-Key": "b85f0b15-71b5-4a27-9655-1bdf47df438a"},
                json={
                    "amount": 250,
                    "name": "Test Donor",
                    "email": "donor@example.com",
                    "phone": "9876543210",
                },
            )
    finally:
        app.dependency_overrides.pop(get_settings, None)

    assert response.status_code == 503
    assert response.json()["detail"] == "Donations are not enabled."


def test_webhook_endpoint_rejects_invalid_signature():
    app.dependency_overrides[get_settings] = lambda: Settings(
        _env_file=None,
        cashfree_client_secret="sandbox-secret",
    )
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/webhooks/cashfree",
                content=b'{"type":"PAYMENT_SUCCESS_WEBHOOK"}',
                headers={
                    "x-webhook-timestamp": "1785401067911",
                    "x-webhook-signature": "invalid",
                },
            )
    finally:
        app.dependency_overrides.pop(get_settings, None)

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid webhook signature."
