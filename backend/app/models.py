from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Donation(Base):
    __tablename__ = "donations"
    __table_args__ = (UniqueConstraint("idempotency_key", name="uq_donation_idempotency_key"),)

    order_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    idempotency_key: Mapped[str] = mapped_column(String(64), nullable=False)
    amount_paise: Mapped[int] = mapped_column(Integer, nullable=False)
    donor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    donor_email: Mapped[str] = mapped_column(String(254), nullable=False)
    donor_phone: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="PENDING")
    payment_session_id: Mapped[str | None] = mapped_column(String(1024))
    cf_payment_id: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    webhook_receipts: Mapped[list["WebhookReceipt"]] = relationship(back_populates="donation")


class WebhookReceipt(Base):
    __tablename__ = "webhook_receipts"

    idempotency_key: Mapped[str] = mapped_column(String(128), primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("donations.order_id"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    donation: Mapped[Donation] = relationship(back_populates="webhook_receipts")
