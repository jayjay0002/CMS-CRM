from datetime import date, datetime, time
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.core.constants import MONEY_PRECISION, MONEY_SCALE
from app.modules.proposals.constants import (
    DECLINE_REASON_MAX_LENGTH,
    DESCRIPTION_MAX_LENGTH,
    MAX_ITEMS,
    MAX_QUANTITY,
    MESSAGE_MAX_LENGTH,
    MIN_QUANTITY,
)
from app.modules.proposals.enums import ProposalStatus

Money = Annotated[Decimal, Field(ge=0, max_digits=MONEY_PRECISION, decimal_places=MONEY_SCALE)]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


# ---------------------------------------------------------------- Admin input


class ProposalItemBody(StrictModel):
    description: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=DESCRIPTION_MAX_LENGTH),
    ]
    quantity: Annotated[int, Field(ge=MIN_QUANTITY, le=MAX_QUANTITY)]
    unit_price: Money


class ProposalUpdate(StrictModel):
    items: Annotated[list[ProposalItemBody], Field(max_length=MAX_ITEMS)]
    discount: Money
    deposit: Money
    valid_until: date
    message: Annotated[
        str | None, StringConstraints(strip_whitespace=True, max_length=MESSAGE_MAX_LENGTH)
    ] = None


# ---------------------------------------------------------------- Shared output


class ProposalItemRead(BaseModel):
    description: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class ProposalTotals(BaseModel):
    subtotal: Decimal
    discount: Decimal
    total: Decimal
    deposit: Decimal
    balance: Decimal


class ProposalRead(ProposalTotals):
    """Admin view of a proposal (the list endpoint returns these too)."""

    id: int
    booking_id: int
    status: ProposalStatus
    is_expired: bool
    items: list[ProposalItemRead]
    valid_until: date
    message: str | None
    sent_at: datetime | None
    viewed_at: datetime | None
    responded_at: datetime | None
    decline_reason: str | None
    created_at: datetime
    public_url: str


# ---------------------------------------------------------------- Public (customer) view


class PublicBusiness(BaseModel):
    name: str
    phone_display: str
    phone_e164: str
    email: str | None


class PublicEvent(BaseModel):
    reference: str
    package_name: str
    event_date: date
    event_start_time: time
    venue_address: str
    guest_count: int


class ProposalPublicView(ProposalTotals):
    business: PublicBusiness
    customer_first_name: str
    event: PublicEvent
    items: list[ProposalItemRead]
    message: str | None
    status: ProposalStatus
    valid_until: date
    is_expired: bool
    responded_at: datetime | None
    decline_reason: str | None


class ProposalDecline(StrictModel):
    reason: Annotated[
        str | None, StringConstraints(strip_whitespace=True, max_length=DECLINE_REASON_MAX_LENGTH)
    ] = None


class ProposalListItem(BaseModel):
    id: int
    booking_id: int
    booking_reference: str
    customer_name: str
    event_date: date
    status: ProposalStatus
    is_expired: bool
    total: Decimal
    deposit: Decimal
    valid_until: date
    sent_at: datetime | None
    viewed_at: datetime | None
    responded_at: datetime | None
    created_at: datetime


class ProposalSummary(BaseModel):
    # Sent proposals still waiting for the customer's answer.
    awaiting_count: int
