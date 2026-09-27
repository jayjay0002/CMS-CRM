import logging
import secrets
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import Select, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError, NotFoundError
from app.core.pagination import PageParams
from app.modules.bookings.constants import MAX_BOOKING_ADVANCE_DAYS, MIN_BOOKING_LEAD_DAYS
from app.modules.bookings.enums import ALLOWED_TRANSITIONS, BookingStatus, BookingTimeframe
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


# ---------------------------------------------------------------- Admin


@dataclass(frozen=True)
class BookingFilters:
    timeframe: BookingTimeframe = BookingTimeframe.UPCOMING
    status: BookingStatus | None = None
    search: str | None = None


LIKE_ESCAPE = "\\"


def _escape_like(text: str) -> str:
    """Makes %, _ and the escape character in user input match literally."""
    for special in (LIKE_ESCAPE, "%", "_"):
        text = text.replace(special, LIKE_ESCAPE + special)
    return text


def _filtered(statement: Select, filters: BookingFilters, today: date) -> Select:
    if filters.timeframe is BookingTimeframe.UPCOMING:
        statement = statement.where(Booking.event_date >= today)
    elif filters.timeframe is BookingTimeframe.PAST:
        statement = statement.where(Booking.event_date < today)
    if filters.status is not None:
        statement = statement.where(Booking.status == filters.status)
    if filters.search:
        pattern = f"%{_escape_like(filters.search.strip())}%"
        statement = statement.where(
            or_(
                Booking.reference.ilike(pattern, escape=LIKE_ESCAPE),
                Booking.customer_name.ilike(pattern, escape=LIKE_ESCAPE),
            )
        )
    return statement


_ORDERING = {
    BookingTimeframe.UPCOMING: (Booking.event_date.asc(), Booking.event_start_time.asc()),
    BookingTimeframe.PAST: (Booking.event_date.desc(), Booking.event_start_time.desc()),
    BookingTimeframe.ALL: (Booking.created_at.desc(),),
}


def list_bookings(
    db: Session, filters: BookingFilters, page: PageParams, *, today: date
) -> tuple[list[Booking], int]:
    """One page of bookings plus the total match count (two queries, whatever the size)."""
    total = db.scalar(_filtered(select(func.count()).select_from(Booking), filters, today)) or 0
    statement = (
        _filtered(select(Booking), filters, today)
        .order_by(*_ORDERING[filters.timeframe], Booking.id)
        .limit(page.limit)
        .offset(page.offset)
    )
    return list(db.scalars(statement).all()), total


def count_pending(db: Session) -> int:
    statement = (
        select(func.count()).select_from(Booking).where(Booking.status == BookingStatus.PENDING)
    )
    return db.scalar(statement) or 0


def get_booking(db: Session, booking_id: int) -> Booking:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found")
    return booking


def allowed_next_statuses(booking: Booking) -> list[BookingStatus]:
    # Stable order for the UI buttons: follow the enum's declaration order.
    allowed = ALLOWED_TRANSITIONS[booking.status]
    return [status for status in BookingStatus if status in allowed]


def change_status(db: Session, booking_id: int, new_status: BookingStatus) -> Booking:
    booking = get_booking(db, booking_id)
    if new_status not in ALLOWED_TRANSITIONS[booking.status]:
        raise BusinessRuleError(
            f"A {booking.status.value} booking can't be marked {new_status.value}"
        )
    booking.status = new_status
    booking.status_changed_at = datetime.now(UTC)
    db.commit()
    return booking


def update_admin_notes(db: Session, booking_id: int, admin_notes: str) -> Booking:
    booking = get_booking(db, booking_id)
    booking.admin_notes = admin_notes or None
    db.commit()
    return booking
