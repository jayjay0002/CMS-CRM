from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import BusinessTodayDep, SessionDep
from app.core.pagination import Page, PageParamsDep
from app.modules.auth import require_admin
from app.modules.bookings import service as bookings_service
from app.modules.bookings.constants import MAX_SEARCH_LENGTH
from app.modules.bookings.enums import BookingStatus, BookingTimeframe
from app.modules.bookings.models import Booking
from app.modules.bookings.schemas import (
    BookingCreate,
    BookingCreated,
    BookingDetail,
    BookingListItem,
    BookingNotesUpdate,
    BookingStatusChange,
    BookingSummary,
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingCreated, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: SessionDep, today: BusinessTodayDep) -> Booking:
    return bookings_service.create_booking(db, payload, today=today)


# ---------------------------------------------------------------- Admin: owners and staff

admin_router = APIRouter(
    prefix="/admin/bookings", tags=["admin bookings"], dependencies=[Depends(require_admin)]
)


def _detail(booking: Booking) -> BookingDetail:
    return BookingDetail.model_validate(
        {
            **BookingListItem.model_validate(booking).model_dump(),
            "package_price": booking.package_price,
            "venue_address": booking.venue_address,
            "customer_phone": booking.customer_phone,
            "customer_email": booking.customer_email,
            "customer_notes": booking.customer_notes,
            "admin_notes": booking.admin_notes,
            "status_changed_at": booking.status_changed_at,
            "allowed_next_statuses": bookings_service.allowed_next_statuses(booking),
        }
    )


@admin_router.get("", response_model=Page[BookingListItem])
def list_bookings(
    db: SessionDep,
    today: BusinessTodayDep,
    page: PageParamsDep,
    timeframe: BookingTimeframe = BookingTimeframe.UPCOMING,
    status_filter: Annotated[BookingStatus | None, Query(alias="status")] = None,
    search: Annotated[str | None, Query(alias="q", max_length=MAX_SEARCH_LENGTH)] = None,
) -> Page[BookingListItem]:
    filters = bookings_service.BookingFilters(
        timeframe=timeframe, status=status_filter, search=search
    )
    bookings, total = bookings_service.list_bookings(db, filters, page, today=today)
    return Page[BookingListItem](
        items=[BookingListItem.model_validate(booking) for booking in bookings],
        total=total,
        limit=page.limit,
        offset=page.offset,
    )


# Declared before /{booking_id} so "summary" isn't read as an id.
@admin_router.get("/summary", response_model=BookingSummary)
def booking_summary(db: SessionDep) -> BookingSummary:
    return BookingSummary(pending_count=bookings_service.count_pending(db))


@admin_router.get("/{booking_id}", response_model=BookingDetail)
def read_booking(booking_id: int, db: SessionDep) -> BookingDetail:
    return _detail(bookings_service.get_booking(db, booking_id))


@admin_router.post("/{booking_id}/status", response_model=BookingDetail)
def change_booking_status(
    booking_id: int, payload: BookingStatusChange, db: SessionDep
) -> BookingDetail:
    return _detail(bookings_service.change_status(db, booking_id, payload.status))


@admin_router.patch("/{booking_id}", response_model=BookingDetail)
def update_booking_notes(
    booking_id: int, payload: BookingNotesUpdate, db: SessionDep
) -> BookingDetail:
    return _detail(bookings_service.update_admin_notes(db, booking_id, payload.admin_notes))
