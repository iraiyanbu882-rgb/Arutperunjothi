import httpx

from app.config import Settings


class CashfreeError(RuntimeError):
    pass


def cashfree_headers(settings: Settings, idempotency_key: str | None = None) -> dict[str, str]:
    headers = {
        "x-client-id": settings.cashfree_client_id,
        "x-client-secret": settings.cashfree_client_secret,
        "x-api-version": settings.cashfree_api_version,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if idempotency_key:
        headers["x-idempotency-key"] = idempotency_key
    return headers


async def create_cashfree_order(
    settings: Settings,
    *,
    order_id: str,
    amount_rupees: int,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    idempotency_key: str,
) -> dict:
    payload = {
        "order_id": order_id,
        "order_amount": amount_rupees,
        "order_currency": "INR",
        "customer_details": {
            "customer_id": f"donor_{order_id[:24]}",
            "customer_name": customer_name,
            "customer_email": customer_email,
            "customer_phone": customer_phone,
        },
        "order_meta": {
            "return_url": f"{settings.frontend_url.rstrip('/')}/?order_id={order_id}#donate",
        },
        "order_note": "Donation to Arutperunjothi Trust",
    }
    return await _request(settings, "POST", "/orders", json=payload, idempotency_key=idempotency_key)


async def fetch_cashfree_order(settings: Settings, order_id: str) -> dict:
    return await _request(settings, "GET", f"/orders/{order_id}")


async def _request(
    settings: Settings,
    method: str,
    path: str,
    *,
    json: dict | None = None,
    idempotency_key: str | None = None,
) -> dict:
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.request(
                method,
                f"{settings.api_base_url}{path}",
                headers=cashfree_headers(settings, idempotency_key),
                json=json,
            )
    except httpx.TimeoutException as error:
        raise CashfreeError("Cashfree request timed out") from error
    except httpx.RequestError as error:
        raise CashfreeError("Cashfree is temporarily unreachable") from error

    if not response.is_success:
        raise CashfreeError(f"Cashfree returned HTTP {response.status_code}")
    try:
        return response.json()
    except ValueError as error:
        raise CashfreeError("Cashfree returned an invalid response") from error
