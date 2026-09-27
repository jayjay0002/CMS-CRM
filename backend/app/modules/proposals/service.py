import secrets
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.core.errors import BusinessRuleError, NotFoundError
from app.core.pagination import PageParams
from app.modules.bookings import (
    Booking,
    BookingStatus,
    approve_if_pending,
    get_booking,
    get_bookings_by_ids,
    search_booking_ids,
)
from app.modules.content import get_branding
from app.modules.notifications import ProposalEmail, ProposalEmailItem
from app.modules.proposals.constants import DEFAULT_VALID_DAYS, PUBLIC_PATH, TOKEN_BYTES
from app.modules.proposals.enums import ProposalListFilter, ProposalStatus
from app.modules.proposals.models import Proposal, ProposalItem
from app.modules.proposals.schemas import (
    ProposalItemRead,
    ProposalListItem,
    ProposalPublicView,
    ProposalRead,
    ProposalUpdate,
    PublicBusiness,
    PublicEvent,
)

ZERO = Decimal("0.00")
CENT = Decimal("0.01")
# A proposal can only be sent or answered while the booking is still live.
OPEN_BOOKING_STATUSES = frozenset({BookingStatus.PENDING, BookingStatus.APPROVED})

NOT_FOUND = "Proposal not found"
DRAFT_ONLY = "Only draft proposals can be changed. Duplicate it to make a new draft."


# ---------------------------------------------------------------- Money and state


@dataclass(frozen=True)
class Totals:
    subtotal: Decimal
    discount: Decimal
    total: Decimal
    deposit: Decimal
    balance: Decimal


def money(value: Decimal) -> Decimal:
    """Always two decimal places, so JSON shows "450.00" (not "450") before and after saving."""
    return value.quantize(CENT)


def line_total(item: ProposalItem) -> Decimal:
    return money(item.unit_price * item.quantity)


def compute_totals(proposal: Proposal) -> Totals:
    subtotal = money(sum((line_total(item) for item in proposal.items), ZERO))
    discount, deposit = money(proposal.discount), money(proposal.deposit)
    total = max(subtotal - discount, ZERO)
    return Totals(
        subtotal=subtotal, discount=discount, total=total, deposit=deposit, balance=total - deposit
    )


def is_expired(proposal: Proposal, today: date) -> bool:
    return proposal.status is ProposalStatus.SENT and proposal.valid_until < today


def public_url(proposal: Proposal) -> str:
    return f"{settings.frontend_url.rstrip('/')}{PUBLIC_PATH}/{proposal.public_token}"


def _item_reads(proposal: Proposal) -> list[ProposalItemRead]:
    return [
        ProposalItemRead(
            description=item.description,
            quantity=item.quantity,
            unit_price=money(item.unit_price),
            line_total=line_total(item),
        )
        for item in proposal.items
    ]


def to_read(proposal: Proposal, today: date) -> ProposalRead:
    totals = compute_totals(proposal)
    return ProposalRead(
        id=proposal.id,
        booking_id=proposal.booking_id,
        status=proposal.status,
        is_expired=is_expired(proposal, today),
        items=_item_reads(proposal),
        subtotal=totals.subtotal,
        discount=totals.discount,
        total=totals.total,
        deposit=totals.deposit,
        balance=totals.balance,
        valid_until=proposal.valid_until,
        message=proposal.message,
        sent_at=proposal.sent_at,
        viewed_at=proposal.viewed_at,
        responded_at=proposal.responded_at,
        decline_reason=proposal.decline_reason,
        created_at=proposal.created_at,
        public_url=public_url(proposal),
    )


def to_email(proposal: Proposal, *, accepted: bool | None = None) -> ProposalEmail:
    totals = compute_totals(proposal)
    return ProposalEmail(
        public_url=public_url(proposal),
        items=[
            ProposalEmailItem(
                description=item.description,
                quantity=item.quantity,
                unit_price=money(item.unit_price),
                line_total=line_total(item),
            )
            for item in proposal.items
        ],
        subtotal=totals.subtotal,
        discount=totals.discount,
        total=totals.total,
        deposit=totals.deposit,
        balance=totals.balance,
        valid_until=proposal.valid_until,
        message=proposal.message,
        accepted=accepted,
        decline_reason=proposal.decline_reason,
    )


# ---------------------------------------------------------------- Reads


def list_for_booking(db: Session, booking_id: int) -> Sequence[Proposal]:
    get_booking(db, booking_id)
    statement = (
        select(Proposal)
        .where(Proposal.booking_id == booking_id)
        .options(selectinload(Proposal.items))
        .order_by(Proposal.created_at.desc(), Proposal.id.desc())
    )
    return db.scalars(statement).all()


def get_proposal(db: Session, proposal_id: int) -> Proposal:
    statement = (
        select(Proposal).where(Proposal.id == proposal_id).options(selectinload(Proposal.items))
    )
    proposal = db.scalars(statement).one_or_none()
    if proposal is None:
        raise NotFoundError(NOT_FOUND)
    return proposal


def get_by_token(db: Session, token: str) -> Proposal:
    statement = (
        select(Proposal).where(Proposal.public_token == token).options(selectinload(Proposal.items))
    )
    proposal = db.scalars(statement).one_or_none()
    # Drafts aren't shared with the customer yet, so their links don't work either.
    if proposal is None or proposal.status is ProposalStatus.DRAFT:
        raise NotFoundError(NOT_FOUND)
    return proposal


# ---------------------------------------------------------------- Admin writes


def _require_draft(proposal: Proposal) -> None:
    if proposal.status is not ProposalStatus.DRAFT:
        raise BusinessRuleError(DRAFT_ONLY)


def _new_token() -> str:
    return secrets.token_urlsafe(TOKEN_BYTES)


def create_draft(db: Session, booking_id: int, *, today: date) -> Proposal:
    booking = get_booking(db, booking_id)
    proposal = Proposal(
        booking_id=booking.id,
        public_token=_new_token(),
        status=ProposalStatus.DRAFT,
        discount=ZERO,
        deposit=ZERO,
        valid_until=today + timedelta(days=DEFAULT_VALID_DAYS),
        items=[
            ProposalItem(
                position=0,
                description=booking.package_name,
                quantity=1,
                unit_price=booking.package_price,
            )
        ],
    )
    db.add(proposal)
    db.commit()
    return get_proposal(db, proposal.id)


def _validate_money(proposal: Proposal) -> None:
    if proposal.deposit > compute_totals(proposal).total:
        raise BusinessRuleError("The deposit can't be more than the total")


def update_draft(db: Session, proposal_id: int, data: ProposalUpdate) -> Proposal:
    proposal = get_proposal(db, proposal_id)
    _require_draft(proposal)
    proposal.items = [
        ProposalItem(
            position=position,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        for position, item in enumerate(data.items)
    ]
    proposal.discount = data.discount
    proposal.deposit = data.deposit
    proposal.valid_until = data.valid_until
    proposal.message = data.message or None
    _validate_money(proposal)
    db.commit()
    return get_proposal(db, proposal.id)


def send(db: Session, proposal_id: int, *, today: date) -> tuple[Proposal, Booking]:
    proposal = get_proposal(db, proposal_id)
    _require_draft(proposal)
    booking = get_booking(db, proposal.booking_id)
    if not proposal.items:
        raise BusinessRuleError("Add at least one line item before sending")
    if compute_totals(proposal).total <= ZERO:
        raise BusinessRuleError("The total must be more than $0 to send a proposal")
    _validate_money(proposal)
    if proposal.valid_until < today:
        raise BusinessRuleError("Set a 'valid until' date of today or later")
    if booking.status not in OPEN_BOOKING_STATUSES:
        raise BusinessRuleError(f"Proposals can't be sent for a {booking.status.value} booking")

    proposal.status = ProposalStatus.SENT
    proposal.sent_at = datetime.now(UTC)
    db.commit()
    return proposal, booking


def duplicate(db: Session, proposal_id: int, *, today: date) -> Proposal:
    original = get_proposal(db, proposal_id)
    default_expiry = today + timedelta(days=DEFAULT_VALID_DAYS)
    copy = Proposal(
        booking_id=original.booking_id,
        public_token=_new_token(),
        status=ProposalStatus.DRAFT,
        discount=original.discount,
        deposit=original.deposit,
        valid_until=max(original.valid_until, default_expiry),
        message=original.message,
        items=[
            ProposalItem(
                position=item.position,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
            )
            for item in original.items
        ],
    )
    db.add(copy)
    db.commit()
    return get_proposal(db, copy.id)


def delete_draft(db: Session, proposal_id: int) -> None:
    proposal = get_proposal(db, proposal_id)
    if proposal.status is not ProposalStatus.DRAFT:
        raise BusinessRuleError("Only draft proposals can be deleted")
    db.delete(proposal)
    db.commit()


# ---------------------------------------------------------------- Customer (public link)


def public_view(db: Session, proposal: Proposal, *, today: date) -> ProposalPublicView:
    booking = get_booking(db, proposal.booking_id)
    branding = get_branding(db)
    totals = compute_totals(proposal)
    return ProposalPublicView(
        business=PublicBusiness(
            name=branding.business_name,
            phone_display=branding.phone_display,
            phone_e164=branding.phone_e164,
            email=branding.email,
        ),
        customer_first_name=booking.customer_name.split()[0] if booking.customer_name else "",
        event=PublicEvent(
            reference=booking.reference,
            package_name=booking.package_name,
            event_date=booking.event_date,
            event_start_time=booking.event_start_time,
            venue_address=booking.venue_address,
            guest_count=booking.guest_count,
        ),
        items=_item_reads(proposal),
        subtotal=totals.subtotal,
        discount=totals.discount,
        total=totals.total,
        deposit=totals.deposit,
        balance=totals.balance,
        message=proposal.message,
        status=proposal.status,
        valid_until=proposal.valid_until,
        is_expired=is_expired(proposal, today),
        responded_at=proposal.responded_at,
        decline_reason=proposal.decline_reason,
    )


def record_view(db: Session, token: str) -> Proposal:
    """Looks up the proposal for its public page, noting the first time it was opened."""
    proposal = get_by_token(db, token)
    if proposal.viewed_at is None:
        proposal.viewed_at = datetime.now(UTC)
        db.commit()
    return proposal


def _open_for_response(db: Session, token: str, today: date) -> tuple[Proposal, Booking]:
    proposal = get_by_token(db, token)
    if proposal.status is not ProposalStatus.SENT:
        raise BusinessRuleError(f"This proposal was already {proposal.status.value}")
    if is_expired(proposal, today):
        raise BusinessRuleError("This proposal has expired. Contact us for a new one.")
    booking = get_booking(db, proposal.booking_id)
    if booking.status not in OPEN_BOOKING_STATUSES:
        raise BusinessRuleError("This booking is no longer open. Contact us for help.")
    return proposal, booking


def accept(db: Session, token: str, *, today: date) -> tuple[Proposal, Booking]:
    proposal, booking = _open_for_response(db, token, today)
    proposal.status = ProposalStatus.ACCEPTED
    proposal.responded_at = datetime.now(UTC)
    # Accepting the quote confirms the booking (the acceptance email covers it).
    approve_if_pending(db, booking)
    db.commit()
    return proposal, booking


def decline(
    db: Session, token: str, reason: str | None, *, today: date
) -> tuple[Proposal, Booking]:
    proposal, booking = _open_for_response(db, token, today)
    proposal.status = ProposalStatus.DECLINED
    proposal.responded_at = datetime.now(UTC)
    proposal.decline_reason = reason or None
    db.commit()
    return proposal, booking


# ---------------------------------------------------------------- All proposals (admin list)


def _filtered(statement: Select, list_filter: ProposalListFilter, today: date) -> Select:
    if list_filter is ProposalListFilter.AWAITING:
        return statement.where(
            Proposal.status == ProposalStatus.SENT, Proposal.valid_until >= today
        )
    if list_filter is ProposalListFilter.EXPIRED:
        return statement.where(Proposal.status == ProposalStatus.SENT, Proposal.valid_until < today)
    if list_filter is ProposalListFilter.ALL:
        return statement
    return statement.where(Proposal.status == ProposalStatus(list_filter.value))


def list_all(
    db: Session,
    list_filter: ProposalListFilter,
    search: str | None,
    page: PageParams,
    *,
    today: date,
) -> tuple[list[ProposalListItem], int]:
    """One page across every booking, newest first. Three queries whatever the size."""
    count_statement = _filtered(select(func.count()).select_from(Proposal), list_filter, today)
    statement = _filtered(select(Proposal), list_filter, today)
    if search and search.strip():
        matching = Proposal.booking_id.in_(search_booking_ids(db, search))
        count_statement = count_statement.where(matching)
        statement = statement.where(matching)

    total = db.scalar(count_statement) or 0
    proposals = db.scalars(
        statement.options(selectinload(Proposal.items))
        .order_by(Proposal.created_at.desc(), Proposal.id.desc())
        .limit(page.limit)
        .offset(page.offset)
    ).all()
    bookings = get_bookings_by_ids(db, [proposal.booking_id for proposal in proposals])
    return [
        _list_item(proposal, bookings[proposal.booking_id], today) for proposal in proposals
    ], total


def _list_item(proposal: Proposal, booking: Booking, today: date) -> ProposalListItem:
    totals = compute_totals(proposal)
    return ProposalListItem(
        id=proposal.id,
        booking_id=proposal.booking_id,
        booking_reference=booking.reference,
        customer_name=booking.customer_name,
        event_date=booking.event_date,
        status=proposal.status,
        is_expired=is_expired(proposal, today),
        total=totals.total,
        deposit=totals.deposit,
        valid_until=proposal.valid_until,
        sent_at=proposal.sent_at,
        viewed_at=proposal.viewed_at,
        responded_at=proposal.responded_at,
        created_at=proposal.created_at,
    )


def count_awaiting(db: Session, *, today: date) -> int:
    statement = _filtered(
        select(func.count()).select_from(Proposal), ProposalListFilter.AWAITING, today
    )
    return db.scalar(statement) or 0
