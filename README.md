# Arutperunjothi Trust website

A responsive, bilingual (English/Tamil) charity website built with React and Vite, with a FastAPI donation API and Cashfree hosted checkout integration.

> **Before launch:** The supplied trust name, registration status, impact figures, and design description are not independently verified here. The poster attachment was not available in the workspace. The website labels impact numbers as pending verification and uses illustrative artwork rather than claiming it depicts real activities. Add approved trust details and real policies before publication.

## Project structure

- `frontend/` — React, Vite, responsive site and Cashfree checkout client.
- `backend/` — FastAPI, SQLAlchemy/SQLite, Cashfree order and verification endpoints.
- `backend/tests/` — basic signature, amount/order verification, validation, and live-mode gate tests.

## Requirements

- Node.js 18+ and npm.
- Python 3.11+.
- Cashfree sandbox account credentials for checkout tests.

## Run locally

1. Configure the API:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   # Set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET from the sandbox dashboard.
   # DONATIONS_ENABLED defaults to false; enable only for private sandbox checkout tests.
   ```

2. Install backend dependencies and start FastAPI:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements-dev.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. In another terminal, install and run the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open the Vite URL, usually `http://localhost:5173`. The frontend defaults to `http://localhost:8000` for the API. Set `VITE_API_BASE_URL` at build time if the API is hosted elsewhere.

4. After adding sandbox credentials, enable checkout only in a private sandbox environment by setting `DONATIONS_ENABLED=true` in `backend/.env` and restarting FastAPI. Sandbox checkout is selected automatically when `CASHFREE_ENV=sandbox`. Do not use live mode until all launch prerequisites below are verified.

## Cashfree configuration

The backend creates all Cashfree orders and keeps the client ID and secret out of the browser bundle. The frontend receives only a `payment_session_id` and uses Cashfree's official hosted checkout SDK. The checkout can offer UPI, cards, and net banking according to Cashfree account and checkout availability.

The payment integration follows Cashfree's official [Create Order](https://www.cashfree.com/docs/api-reference/payments/latest/orders/create-order.md), [Get Order](https://www.cashfree.com/docs/api-reference/payments/latest/orders/get-order.md), [Payment Webhooks](https://www.cashfree.com/docs/api-reference/payments/latest/payments/webhooks.md), and [Webhook Signature Verification](https://www.cashfree.com/docs/payments/online/webhooks/signature-verification.md) documentation.

To configure sandbox webhooks:

1. Expose the API over HTTPS using a trusted tunnel or staging deployment.
2. Register `https://<your-api-host>/api/webhooks/cashfree` in the Cashfree sandbox dashboard for payment success webhooks.
3. Set `PUBLIC_BASE_URL` and `FRONTEND_URL` to the deployed origins and update `CORS_ORIGINS`.
4. Test successful, failed, cancelled, and duplicate webhook deliveries before accepting real donations.

The webhook verifies Cashfree's HMAC signature over the exact raw request body. It then fetches the order from Cashfree and checks order ID, paid status, INR currency, and amount before marking it paid. Repeated webhook events are deduplicated with Cashfree's idempotency header and a database receipt table. The return page also checks payment status through the backend; a browser redirect alone never marks a donation successful.

## Tests and production build

```powershell
cd backend
pip install -r requirements-dev.txt
pytest
```

```powershell
cd frontend
npm run build
```

## Before enabling live donations

Do not enable live payments until the trustees have verified and approved all of the following:

- Trust's legal name, registration certificate and number, registration jurisdiction, registered address, and authorised contact details.
- Whether the trust is permitted to solicit and receive the intended donations, including applicable payment-provider onboarding and Indian regulatory requirements.
- Any tax exemption or donor tax-benefit statement. **None is claimed by this website.** Do not advertise one unless eligibility is confirmed and the required registration/approval is current.
- Impact figures (12,500+ meals, 1,000+ clothing items, and three years of service), reporting period, and evidence.
- Actual photographs and permissions for people pictured.
- Trust-approved privacy, donation terms, refund/cancellation, receipt, and grievance policies.
- Cashfree production account, verified settlement bank account, production keys, webhook configuration, and end-to-end test.
- Production frontend/API origins, HTTPS, database backups, monitoring, and retention/deletion process for donor information.

The backend requires both `DONATIONS_ENABLED=true` and valid credentials. Production additionally requires `CASHFREE_ENV=production`, `ENABLE_LIVE_DONATIONS=true`, `LIVE_DONATION_COMPLIANCE_CONFIRMED=true`, and an HTTPS `PUBLIC_BASE_URL`. Set the compliance confirmation only after every item in the checklist above has been reviewed and approved. Keep live credentials in the deployment secret store; never commit `.env`.

## Deployment notes

- Build the static frontend with `npm run build` and serve `frontend/dist` from an HTTPS static host.
- Run the backend with a production ASGI server behind HTTPS. SQLite is the configured database for this runnable starter. For multi-instance production, migrate to managed PostgreSQL and add a PostgreSQL driver plus a migration strategy before deployment.
- Set `CORS_ORIGINS` to the exact frontend origin(s), not `*`.
- Configure webhook URL and `PUBLIC_BASE_URL` to the public API. Verify webhook delivery in Cashfree before switching traffic.
- Use an operational backup/retention policy for donor details. Donor name, email, and phone are stored to create and reconcile a payment; implement the approved retention policy before launch.
