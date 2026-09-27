from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import MONEY_PRECISION, MONEY_SCALE
from app.db.base import Base, TimestampMixin, enum_values
from app.modules.proposals.constants import DESCRIPTION_MAX_LENGTH, TOKEN_MAX_LENGTH
from app.modules.proposals.enums import ProposalStatus


class Proposal(TimestampMixin, Base):
    __tablename__ = "proposals"
    __table_args__ = (
        CheckConstraint("discount >= 0", name="discount_not_negative"),
        CheckConstraint("deposit >= 0", name="deposit_not_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="RESTRICT"), index=True
    )
    # Secret link for the customer; long and random so it can't be guessed.
    public_token: Mapped[str] = mapped_column(String(TOKEN_MAX_LENGTH), unique=True)
    status: Mapped[ProposalStatus] = mapped_column(
        Enum(ProposalStatus, name="proposal_status", values_callable=enum_values),
        default=ProposalStatus.DRAFT,
    )
    message: Mapped[str | None] = mapped_column(Text)
    discount: Mapped[Decimal] = mapped_column(Numeric(MONEY_PRECISION, MONEY_SCALE))
    deposit: Mapped[Decimal] = mapped_column(Numeric(MONEY_PRECISION, MONEY_SCALE))
    valid_until: Mapped[date]
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    decline_reason: Mapped[str | None] = mapped_column(Text)

    # Always loaded on purpose (selectinload); lazy="raise" makes accidental N+1s fail loudly.
    items: Mapped[list["ProposalItem"]] = relationship(
        lazy="raise",
        order_by="ProposalItem.position",
        cascade="all, delete-orphan",
    )


class ProposalItem(Base):
    __tablename__ = "proposal_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="quantity_positive"),
        CheckConstraint("unit_price >= 0", name="unit_price_not_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    proposal_id: Mapped[int] = mapped_column(
        ForeignKey("proposals.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int]
    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH))
    quantity: Mapped[int]
    unit_price: Mapped[Decimal] = mapped_column(Numeric(MONEY_PRECISION, MONEY_SCALE))
