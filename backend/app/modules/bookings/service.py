import logging
import secrets
from datetime import date, timedelta

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError
from app.modules.bookings.constants import MAX_BOOKING_ADVANCE_DAYS, MIN_BOOKING_LEAD_DAYS
from app.modules.bookings.enums import BookingStatus
from app.modules.bookings.models import Booking
from app.modules.bookings.schemas import BookingCreate
from app.modules.packages import Package, find_active_package

logger = logging.getLogger(__name__)

REFERENCE_PREFIX = "PC"
# No 0/O or 1/I/L, so references are easy to read out over the phone.
REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
REFERENCE_CODE_LENGTH = 6
MAX_REFERENCE_ATTEMPTS = 5


def generate_reference() -> str:
    code = "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(REFERENCE_CODE_LENGTH))
    return f"{REFERENCE_PREFIX}-{code}"


def bookable_date_range(today: date) -> tuple[date, date]:
    return (
        today + timedelta(days=MIN_BOOKING_LEAD_DAYS),
        today + timedelta(days=MAX_BOOKING_ADVANCE_DAYS),
    )


def _validate_event_date(event_date: date, today: date) -> None:
    earliest, latest = bookable_date_range(today)
    if not earliest <= event_date <= latest:
        raise BusinessRuleError(
            f"Choose an event date between {earliest.isoformat()} and {latest.isoformat()}"
        )


def _build_booking(data: BookingCreate, package: Package) -> Booking:
    return Booking(
        reference=generate_reference(),
        package_id=package.id,
        package_name=package.name,
        package_price=package.price,
        event_date=data.event_date,
        event_start_time=data.event_start_time,
        venue_address=data.venue_address,
        guest_count=data.guest_count,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=str(data.customer_email),
        customer_notes=data.customer_notes or None,
        status=BookingStatus.PENDING,
    )


def _save_with_unique_reference(db: Session, booking: Booking) -> None:
    for _ in range(MAX_REFERENCE_ATTEMPTS):
        try:
            with db.begin_nested():
                db.add(booking)
                db.flush()
        except IntegrityError:
            # Almost certainly a reference collision; draw a new one and retry.
            booking.reference = generate_reference()
            continue
        return
    raise RuntimeError("Could not generate a unique booking reference")


def create_booking(db: Session, data: BookingCreate, *, today: date) -> Booking:
    package = find_active_package(db, data.package_slug)
    if package is None:
        raise BusinessRuleError("That package isn't available. Choose another package.")
    _validate_event_date(data.event_date, today)

    booking = _build_booking(data, package)

    if data.website:
        # Honeypot filled in: answer like a success so bots learn nothing, but store nothing.
        logger.info("Dropped booking request that filled the honeypot field")
        return booking

    _save_with_unique_reference(db, booking)
    db.commit()
    return booking
