from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import MAX_EMAIL_LENGTH
from app.db.base import Base, TimestampMixin, enum_values
from app.modules.notifications.constants import PROVIDER_ID_MAX_LENGTH, SUBJECT_MAX_LENGTH
from app.modules.notifications.enums import EmailStatus, EmailTemplate


class EmailLog(TimestampMixin, Base):
    """One row per email we tried (or skipped) to send."""

    __tablename__ = "email_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Foreign keys by table name only: this module never imports bookings or proposals.
    booking_id: Mapped[int | None] = mapped_column(
        ForeignKey("bookings.id", ondelete="SET NULL"), index=True
    )
    proposal_id: Mapped[int | None] = mapped_column(
        ForeignKey("proposals.id", ondelete="SET NULL"), index=True
    )
    template: Mapped[EmailTemplate] = mapped_column(
        Enum(EmailTemplate, name="email_template", values_callable=enum_values)
    )
    to_address: Mapped[str] = mapped_column(String(MAX_EMAIL_LENGTH))
    subject: Mapped[str] = mapped_column(String(SUBJECT_MAX_LENGTH))
    status: Mapped[EmailStatus] = mapped_column(
        Enum(EmailStatus, name="email_status", values_callable=enum_values)
    )
    provider_message_id: Mapped[str | None] = mapped_column(String(PROVIDER_ID_MAX_LENGTH))
    error: Mapped[str | None] = mapped_column(Text)
