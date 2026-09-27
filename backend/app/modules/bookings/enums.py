from enum import StrEnum


class BookingStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Which statuses a booking may move to next. Declined, completed and cancelled are final.
ALLOWED_TRANSITIONS: dict[BookingStatus, frozenset[BookingStatus]] = {
    BookingStatus.PENDING: frozenset(
        {BookingStatus.APPROVED, BookingStatus.DECLINED, BookingStatus.CANCELLED}
    ),
    BookingStatus.APPROVED: frozenset({BookingStatus.COMPLETED, BookingStatus.CANCELLED}),
    BookingStatus.DECLINED: frozenset(),
    BookingStatus.COMPLETED: frozenset(),
    BookingStatus.CANCELLED: frozenset(),
}


class BookingTimeframe(StrEnum):
    """Which events the admin list shows, and in what order."""

    UPCOMING = "upcoming"  # today onwards, soonest first
    PAST = "past"  # before today, most recent first
    ALL = "all"  # everything, newest request first
