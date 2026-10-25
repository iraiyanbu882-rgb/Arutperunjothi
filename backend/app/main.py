import base64
import hashlib
import hmac
import json
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
from urllib.parse import urlencode

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import cashfree
from app.auth import (
    create_pkce_pair,
    create_session_token,
    hash_oauth_state,
    hash_password,
    hash_session_token,
    verify_password,
)
from app.cashfree import CashfreeError
from app.config import Settings, get_settings
from app.database import Base, SessionLocal, engine
from app.models import AuthSession, Donation, OAuthState, User, WebhookReceipt, utc_now
from app.schemas import (
    DonationOrderRequest,
    DonationOrderResponse,
    DonationStatusResponse,
    PublicConfigResponse,
    SignInRequest,
    SignUpRequest,
    UserResponse,
)

AUTH_COOKIE = "arut_session"
GOOGLE_STATE_COOKIE = "arut_google_state"
AUTH_SESSION_DAYS = 30
GOOGLE_STATE_MINUTES = 10
_DUMMY_PASSWORD_HASH = hash_password("not-a-real-user-password")
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
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Idempotency-Key"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_trusted_origin(request: Request, settings: Settings) -> None:
    if request.headers.get("origin") not in settings.cors_origin_list:
        raise HTTPException(status_code=403, detail="Request origin is not allowed.")


def require_donations_enabled(settings: Settings) -> None:
    if not settings.can_accept_donations:
        raise HTTPException(status_code=503, detail="Donations are not enabled.")


def set_auth_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        AUTH_COOKIE,
        token,
        max_age=AUTH_SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/",
    )


def create_auth_session(db: Session, user: User) -> str:
    now = utc_now()
    db.query(AuthSession).filter(AuthSession.expires_at < now).delete()
    token = create_session_token()
    db.add(
        AuthSession(
            token_hash=hash_session_token(token),
            user_id=user.id,
            expires_at=now + timedelta(days=AUTH_SESSION_DAYS),
        )
    )
    db.commit()
    return token


def user_response(user: User) -> UserResponse:
    return UserResponse(id=user.id, name=user.name, email=user.email)


def _frontend_auth_redirect(status: str) -> RedirectResponse:
    return RedirectResponse(
        f"{get_settings().frontend_url.rstrip('/')}/?auth={status}",
        status_code=303,
    )


def _valid_expiry(expires_at: datetime, now: datetime) -> bool:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > now


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
        google_sign_in_enabled=settings.google_sign_in_enabled,
        google_redirect_uri=settings.google_redirect_uri,
    )


@app.get("/api/auth/me", response_model=UserResponse)
def auth_me(
    request: Request,
    db: Session = Depends(get_db),
):
    token = request.cookies.get(AUTH_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not signed in.")
    session = db.get(AuthSession, hash_session_token(token))
    if not session or not _valid_expiry(session.expires_at, utc_now()):
        raise HTTPException(status_code=401, detail="Not signed in.")
    user = db.get(User, session.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not signed in.")
    return user_response(user)


@app.post("/api/auth/signup", response_model=UserResponse, status_code=201)
def auth_signup(
    payload: SignUpRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    require_trusted_origin(request, settings)
    user = User(
        id=str(uuid.uuid4()),
        name=payload.name,
        email=str(payload.email),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.flush()
        token = create_auth_session(db, user)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.") from error
    set_auth_cookie(response, token, settings)
    return user_response(user)


@app.post("/api/auth/signin", response_model=UserResponse)
def auth_signin(
    payload: SignInRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    require_trusted_origin(request, settings)
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    password_hash = user.password_hash if user and user.password_hash else _DUMMY_PASSWORD_HASH
    if not verify_password(payload.password, password_hash) or not user:
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    token = create_auth_session(db, user)
    set_auth_cookie(response, token, settings)
    return user_response(user)


@app.post("/api/auth/signout", status_code=204)
def auth_signout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    require_trusted_origin(request, settings)
    token = request.cookies.get(AUTH_COOKIE)
    if token:
        session = db.get(AuthSession, hash_session_token(token))
        if session:
            db.delete(session)
            db.commit()
    response.delete_cookie(AUTH_COOKIE, path="/", httponly=True, secure=settings.auth_cookie_secure, samesite="lax")


@app.get("/api/auth/google/start")
def google_auth_start(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    if not settings.google_sign_in_enabled:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured.")

    state = secrets.token_urlsafe(32)
    verifier, challenge = create_pkce_pair()
    db.query(OAuthState).filter(OAuthState.expires_at < utc_now()).delete()
    db.add(
        OAuthState(
            state_hash=hash_oauth_state(state),
            code_verifier=verifier,
            expires_at=utc_now() + timedelta(minutes=GOOGLE_STATE_MINUTES),
        )
    )
    db.commit()
    callback_url = settings.google_redirect_uri
    query = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": callback_url,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "access_type": "online",
        }
    )
    redirect = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}", status_code=302)
    redirect.set_cookie(
        GOOGLE_STATE_COOKIE,
        state,
        max_age=GOOGLE_STATE_MINUTES * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/api/auth/google",
    )
    return redirect


@app.get("/api/auth/google/callback")
async def google_auth_callback(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    state = request.query_params.get("state", "")
    state_cookie = request.cookies.get(GOOGLE_STATE_COOKIE, "")
    if not state or not state_cookie or not hmac.compare_digest(state, state_cookie):
        return _frontend_auth_redirect("google_error")
    state_record = db.get(OAuthState, hash_oauth_state(state))
    if not state_record or not _valid_expiry(state_record.expires_at, utc_now()):
        return _frontend_auth_redirect("google_error")
    code_verifier = state_record.code_verifier
    db.delete(state_record)
    db.commit()
    if request.query_params.get("error") or not request.query_params.get("code"):
        return _frontend_auth_redirect("google_error")

    callback_url = settings.google_redirect_uri
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": request.query_params["code"],
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": callback_url,
                    "grant_type": "authorization_code",
                    "code_verifier": code_verifier,
                },
            )
            if not token_response.is_success:
                return _frontend_auth_redirect("google_error")
            token_data = token_response.json()
            if not isinstance(token_data, dict):
                return _frontend_auth_redirect("google_error")
            access_token = token_data.get("access_token")
            if not isinstance(access_token, str) or not access_token:
                return _frontend_auth_redirect("google_error")
            profile_response = await client.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if not profile_response.is_success:
                return _frontend_auth_redirect("google_error")
            profile = profile_response.json()
    except (httpx.RequestError, ValueError):
        return _frontend_auth_redirect("google_error")
    if not isinstance(profile, dict):
        return _frontend_auth_redirect("google_error")

    subject = profile.get("sub")
    email = profile.get("email")
    name = profile.get("name")
    if (
        not isinstance(subject, str)
        or not subject
        or not isinstance(email, str)
        or not isinstance(name, str)
        or profile.get("email_verified") is not True
    ):
        return _frontend_auth_redirect("google_error")

    email = email.strip().lower()
    user = db.scalar(select(User).where(User.google_subject == subject))
    if not user:
        user = db.scalar(select(User).where(User.email == email))
        if user:
            if user.google_subject and user.google_subject != subject:
                return _frontend_auth_redirect("google_error")
            user.google_subject = subject
        else:
            user = User(
                id=str(uuid.uuid4()),
                name=" ".join(name.split())[:100] or email,
                email=email,
                google_subject=subject,
            )
            db.add(user)
            try:
                db.flush()
            except IntegrityError:
                db.rollback()
                return _frontend_auth_redirect("google_error")
    token = create_auth_session(db, user)
    redirect = _frontend_auth_redirect("google_success")
    redirect.set_cookie(
        AUTH_COOKIE,
        token,
        max_age=AUTH_SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/",
    )
    redirect.delete_cookie(
        GOOGLE_STATE_COOKIE,
        path="/api/auth/google",
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
    )
    return redirect


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
    require_donations_enabled(settings)

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
