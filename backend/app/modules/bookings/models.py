from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import MAX_EMAIL_LENGTH, MONEY_PRECISION, MONEY_SCALE
from app.db.base import Base, TimestampMixin, enum_values
from app.modules.bookings.constants import (
    BOOKING_REFERENCE_MAX_LENGTH,
    MAX_ADDRESS_LENGTH,
    MAX_CUSTOMER_NAME_LENGTH,
    MAX_PHONE_LENGTH,
)
from app.modules.bookings.enums import BookingStatus
from app.modules.packages import PACKAGE_NAME_MAX_LENGTH


class Booking(TimestampMixin, Base):
    __tablename__ = "bookings"
    __table_args__ = (CheckConstraint("guest_count > 0", name="guest_count_positive"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(BOOKING_REFERENCE_MAX_LENGTH), unique=True)

    package_id: Mapped[int] = mapped_column(
        ForeignKey("packages.id", ondelete="RESTRICT"), index=True
    )
    # Snapshots, so later package edits don't rewrite past bookings.
    package_name: Mapped[str] = mapped_column(String(PACKAGE_NAME_MAX_LENGTH))
    package_price: Mapped[Decimal] = mapped_column(Numeric(MONEY_PRECISION, MONEY_SCALE))

    event_date: Mapped[date] = mapped_column(index=True)
    event_start_time: Mapped[time]
    venue_address: Mapped[str] = mapped_column(String(MAX_ADDRESS_LENGTH))
    guest_count: Mapped[int]

    customer_name: Mapped[str] = mapped_column(String(MAX_CUSTOMER_NAME_LENGTH))
    customer_phone: Mapped[str] = mapped_column(String(MAX_PHONE_LENGTH))
    customer_email: Mapped[str] = mapped_column(String(MAX_EMAIL_LENGTH))
    customer_notes: Mapped[str | None] = mapped_column(Text)

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status", values_callable=enum_values),
        default=BookingStatus.PENDING,
        server_default=BookingStatus.PENDING.value,
        index=True,
    )
    admin_notes: Mapped[str | None] = mapped_column(Text)
    status_changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
