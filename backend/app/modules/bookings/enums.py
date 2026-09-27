from enum import StrEnum


class BookingStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
