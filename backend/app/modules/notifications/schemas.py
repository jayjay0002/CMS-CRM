from dataclasses import dataclass
from datetime import date, datetime, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.modules.notifications.enums import EmailStatus, EmailTemplate

# ---------------------------------------------------------------- Email data (plain values)
# Callers build these from their own models, so this module never imports bookings/proposals.


@dataclass(frozen=True)
class BookingEmail:
    reference: str
    customer_name: str
    customer_email: str
    package_name: str
    event_date: date
    event_start_time: time
    venue_address: str
    guest_count: int

    @property
    def first_name(self) -> str:
        return self.customer_name.split()[0] if self.customer_name.strip() else ""


@dataclass(frozen=True)
class ProposalEmailItem:
    description: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


@dataclass(frozen=True)
class ProposalEmail:
    public_url: str
    items: list[ProposalEmailItem]
    subtotal: Decimal
    discount: Decimal
    total: Decimal
    deposit: Decimal
    balance: Decimal
    valid_until: date
    message: str | None
    # Set for proposal_response emails.
    accepted: bool | None = None
    decline_reason: str | None = None


@dataclass(frozen=True)
class EmailRequest:
    template: EmailTemplate
    to_address: str | None
    booking: BookingEmail
    proposal: ProposalEmail | None = None
    # Optional personal note from the admin (booking_declined).
    message: str | None = None
    booking_id: int | None = None
    proposal_id: int | None = None


@dataclass(frozen=True)
class OutgoingEmail:
    from_address: str
    to_address: str
    subject: str
    html: str
    text: str
    reply_to: str | None = None


# ---------------------------------------------------------------- API


class EmailLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    template: EmailTemplate
    to_address: str
    subject: str
    status: EmailStatus
    error: str | None
    created_at: datetime
