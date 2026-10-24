import base64
import hashlib
import hmac
import json
import uuid
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import cashfree
from app.cashfree import CashfreeError
from app.config import Settings, get_settings
from app.database import Base, SessionLocal, engine
from app.models import Donation, WebhookReceipt, utc_now
from app.schemas import (
    DonationOrderRequest,
    DonationOrderResponse,
    DonationStatusResponse,
    PublicConfigResponse,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Arutperunjothi Trust Donations API",
    version="1.0.0",
    description="Donation order, status, and Cashfree webhook endpoints.",
    docs_url=None,
    redoc_url=None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Idempotency-Key"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _donation_response(donation: Donation, payment_mode: str) -> DonationOrderResponse:
    if not donation.payment_session_id:
        raise HTTPException(status_code=503, detail="Payment session is not ready; retry with the same idempotency key.")
    return DonationOrderResponse(
        order_id=donation.order_id,
        payment_session_id=donation.payment_session_id,
        payment_mode=payment_mode,
    )


def _verified_paid_order(order: dict, donation: Donation) -> bool:
    try:
        amount = Decimal(str(order["order_amount"]))
    except (KeyError, InvalidOperation, TypeError):
        return False
    return (
        order.get("order_id") == donation.order_id
        and order.get("order_status") == "PAID"
        and order.get("order_currency") == "INR"
        and amount == Decimal(donation.amount_paise) / Decimal(100)
    )


async def _confirm_donation(db: Session, donation: Donation, settings: Settings, payment_id: str | None = None) -> bool:
    try:
        remote_order = await cashfree.fetch_cashfree_order(settings, donation.order_id)
    except CashfreeError as error:
        raise HTTPException(status_code=502, detail="Unable to verify payment with Cashfree.") from error
    if not _verified_paid_order(remote_order, donation):
        return False
    donation.status = "PAID"
    donation.cf_payment_id = payment_id or donation.cf_payment_id
    donation.paid_at = donation.paid_at or utc_now()
    db.commit()
    return True


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/config", response_model=PublicConfigResponse)
def public_config(settings: Settings = Depends(get_settings)):
    return PublicConfigResponse(
        donations_enabled=settings.can_accept_donations,
        payment_mode=settings.payment_mode,
    )


@app.post("/api/donations/orders", response_model=DonationOrderResponse)
async def create_donation_order(
    payload: DonationOrderRequest,
    idempotency_key: str = Header(alias="Idempotency-Key", min_length=36, max_length=36),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    try:
        uuid.UUID(idempotency_key)
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Idempotency-Key must be a UUID.") from error
    if not settings.can_accept_donations:
        raise HTTPException(status_code=503, detail="Donations are not enabled.")

    donation = db.scalar(select(Donation).where(Donation.idempotency_key == idempotency_key))
    if donation:
        if (
            donation.amount_paise != payload.amount * 100
            or donation.donor_name != payload.name
            or donation.donor_email != str(payload.email)
            or donation.donor_phone != payload.phone
        ):
            raise HTTPException(status_code=409, detail="Idempotency key was already used for another request.")
        if donation.payment_session_id:
            return _donation_response(donation, settings.payment_mode)
    else:
        donation = Donation(
            order_id=f"apt_{uuid.uuid4().hex}",
            idempotency_key=idempotency_key,
            amount_paise=payload.amount * 100,
            donor_name=payload.name,
            donor_email=str(payload.email),
            donor_phone=payload.phone,
            status="PENDING",
        )
        db.add(donation)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            existing = db.scalar(select(Donation).where(Donation.idempotency_key == idempotency_key))
            if existing:
                return _donation_response(existing, settings.payment_mode)
            raise HTTPException(status_code=409, detail="Could not create a unique donation order.")

    try:
        response = await cashfree.create_cashfree_order(
            settings,
            order_id=donation.order_id,
            amount_rupees=payload.amount,
            customer_name=payload.name,
            customer_email=str(payload.email),
            customer_phone=payload.phone,
            idempotency_key=idempotency_key,
        )
    except CashfreeError as error:
        raise HTTPException(status_code=502, detail="Unable to create a payment session with Cashfree.") from error

    session_id = response.get("payment_session_id")
    if response.get("order_id") != donation.order_id or not isinstance(session_id, str) or not session_id:
        raise HTTPException(status_code=502, detail="Cashfree did not return a payment session.")
    donation.payment_session_id = session_id
    db.commit()
    return _donation_response(donation, settings.payment_mode)


@app.get("/api/donations/{order_id}", response_model=DonationStatusResponse)
async def get_donation_status(
    order_id: str,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    donation = db.get(Donation, order_id)
    if donation is None:
        raise HTTPException(status_code=404, detail="Donation order not found.")
    if donation.status != "PAID":
        await _confirm_donation(db, donation, settings)
    return DonationStatusResponse(
        order_id=donation.order_id,
        status=donation.status,
        amount=donation.amount_paise // 100,
    )


def verify_webhook_signature(raw_body: bytes, timestamp: str, signature: str, secret: str) -> bool:
    signed_payload = timestamp.encode("utf-8") + raw_body
    digest = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode("ascii")
    return hmac.compare_digest(expected, signature)


@app.post("/api/webhooks/cashfree")
async def cashfree_webhook(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    raw_body = await request.body()
    if len(raw_body) > 1_000_000:
        raise HTTPException(status_code=413, detail="Webhook payload is too large.")

    signature = request.headers.get("x-webhook-signature", "")
    timestamp = request.headers.get("x-webhook-timestamp", "")
    if not signature or not timestamp or not settings.cashfree_client_secret:
        raise HTTPException(status_code=400, detail="Missing webhook signature headers.")
    if not verify_webhook_signature(raw_body, timestamp, signature, settings.cashfree_client_secret):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    try:
        event = json.loads(raw_body)
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise HTTPException(status_code=400, detail="Invalid webhook JSON.") from error
    if not isinstance(event, dict):
        raise HTTPException(status_code=400, detail="Invalid webhook event.")
    if event.get("type") != "PAYMENT_SUCCESS_WEBHOOK":
        return {"received": True, "processed": False}

    data = event.get("data") or {}
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Invalid webhook data.")
    order = data.get("order") or {}
    payment = data.get("payment") or {}
    if not isinstance(order, dict) or not isinstance(payment, dict):
        raise HTTPException(status_code=400, detail="Invalid webhook payment data.")
    order_id = order.get("order_id")
    payment_id = payment.get("cf_payment_id")
    if not isinstance(order_id, str) or not isinstance(payment_id, (str, int)):
        raise HTTPException(status_code=400, detail="Webhook is missing payment identifiers.")
    donation = db.get(Donation, order_id)
    if donation is None:
        return {"received": True, "processed": False}

    supplied_idempotency = request.headers.get("x-idempotency-key", "")
    receipt_key = supplied_idempotency or hashlib.sha256(timestamp.encode() + raw_body).hexdigest()
    if len(receipt_key) > 128:
        raise HTTPException(status_code=400, detail="Invalid webhook idempotency key.")

    if db.get(WebhookReceipt, receipt_key):
        return {"received": True, "processed": True, "duplicate": True}

    try:
        paid = await _confirm_donation(db, donation, settings, str(payment_id))
        if not paid:
            raise HTTPException(status_code=503, detail="Cashfree has not confirmed this order as paid.")
        db.add(
            WebhookReceipt(
                idempotency_key=receipt_key,
                order_id=donation.order_id,
                event_type=event["type"],
                received_at=datetime.now(timezone.utc),
            )
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"received": True, "processed": True, "duplicate": True}
    return {"received": True, "processed": True}
