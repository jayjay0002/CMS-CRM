from datetime import date, time
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from app.core.constants import MAX_EMAIL_LENGTH
from app.modules.bookings.constants import (
    MAX_ADDRESS_LENGTH,
    MAX_CUSTOMER_NAME_LENGTH,
    MAX_GUEST_COUNT,
    MAX_HONEYPOT_LENGTH,
    MAX_NOTES_LENGTH,
    MIN_ADDRESS_LENGTH,
    MIN_GUEST_COUNT,
)
from app.modules.bookings.enums import BookingStatus
from app.modules.packages import PACKAGE_SLUG_MAX_LENGTH

# Digits plus the usual phone punctuation; 7-20 characters.
PHONE_PATTERN = r"^[0-9()+\-.\s]{7,20}$"

TrimmedStr = Annotated[str, StringConstraints(strip_whitespace=True)]


class BookingCreate(BaseModel):
    package_slug: Annotated[TrimmedStr, Field(min_length=1, max_length=PACKAGE_SLUG_MAX_LENGTH)]
    event_date: date
    event_start_time: time
    venue_address: Annotated[
        TrimmedStr, Field(min_length=MIN_ADDRESS_LENGTH, max_length=MAX_ADDRESS_LENGTH)
    ]
    guest_count: Annotated[int, Field(ge=MIN_GUEST_COUNT, le=MAX_GUEST_COUNT)]
    customer_name: Annotated[TrimmedStr, Field(min_length=1, max_length=MAX_CUSTOMER_NAME_LENGTH)]
    customer_phone: Annotated[TrimmedStr, Field(pattern=PHONE_PATTERN)]
    customer_email: Annotated[EmailStr, Field(max_length=MAX_EMAIL_LENGTH)]
    customer_notes: Annotated[TrimmedStr | None, Field(max_length=MAX_NOTES_LENGTH)] = None
    # Honeypot: hidden in the form, so only bots fill it in.
    website: Annotated[str, Field(max_length=MAX_HONEYPOT_LENGTH)] = ""


class BookingCreated(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reference: str
    package_name: str
    event_date: date
    event_start_time: time
    status: BookingStatus
