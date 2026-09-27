import logging
from collections.abc import Callable, Sequence
from typing import Annotated

from fastapi import BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.modules.content import get_branding
from app.modules.notifications.constants import ERROR_MAX_LENGTH, NO_RECIPIENT, NOT_CONFIGURED
from app.modules.notifications.enums import EmailStatus
from app.modules.notifications.models import EmailLog
from app.modules.notifications.rendering import render_email
from app.modules.notifications.schemas import EmailRequest, OutgoingEmail
from app.modules.notifications.senders import EmailSender, ResendSender

logger = logging.getLogger(__name__)

SessionFactory = Callable[[], Session]


def test_subject(original_recipient: str, subject: str) -> str:
    return f"[TEST → {original_recipient}] {subject}"


class EmailDispatcher:
    """Queues emails to be sent after the response, and logs every attempt.

    Sending never raises into the request: failures end up in email_log as "failed".
    """

    def __init__(
        self,
        sender: EmailSender | None,
        session_factory: SessionFactory,
        *,
        from_address: str,
        reply_to: str | None = None,
        test_recipient: str | None = None,
    ) -> None:
        self._sender = sender
        self._session_factory = session_factory
        self._from_address = from_address
        self._reply_to = reply_to
        self._test_recipient = test_recipient

    def enqueue(self, background_tasks: BackgroundTasks, request: EmailRequest) -> None:
        background_tasks.add_task(self.deliver, request)

    def deliver(self, request: EmailRequest) -> None:
        with self._session_factory() as db:
            log = EmailLog(
                booking_id=request.booking_id,
                proposal_id=request.proposal_id,
                template=request.template,
                to_address=request.to_address or "",
                subject="",
                status=EmailStatus.SKIPPED,
            )
            try:
                self._send(db, request, log)
            except Exception as error:  # Any failure is recorded, never raised to the caller.
                logger.exception("Sending %s email failed", request.template.value)
                log.status = EmailStatus.FAILED
                log.error = str(error)[:ERROR_MAX_LENGTH]
            db.add(log)
            db.commit()

    def _send(self, db: Session, request: EmailRequest, log: EmailLog) -> None:
        rendered = render_email(request, get_branding(db))
        log.subject = rendered.subject
        if not request.to_address:
            log.error = NO_RECIPIENT
            return

        to_address, subject = request.to_address, rendered.subject
        if self._test_recipient:
            to_address, subject = self._test_recipient, test_subject(to_address, subject)
        log.to_address, log.subject = to_address, subject

        if self._sender is None:
            log.error = NOT_CONFIGURED
            return
        log.provider_message_id = self._sender.send(
            OutgoingEmail(
                from_address=self._from_address,
                to_address=to_address,
                subject=subject,
                html=rendered.html,
                text=rendered.text,
                reply_to=self._reply_to,
            )
        )
        log.status = EmailStatus.SENT


def get_email_dispatcher() -> EmailDispatcher:
    """FastAPI dependency. Tests override it with a fake sender and the test session."""
    sender = ResendSender(settings.resend_api_key) if settings.resend_api_key else None
    return EmailDispatcher(
        sender,
        SessionLocal,
        from_address=settings.email_from,
        reply_to=settings.email_reply_to,
        test_recipient=settings.email_test_recipient,
    )


EmailDispatcherDep = Annotated[EmailDispatcher, Depends(get_email_dispatcher)]


def list_email_log(db: Session, booking_id: int) -> Sequence[EmailLog]:
    statement = (
        select(EmailLog)
        .where(EmailLog.booking_id == booking_id)
        .order_by(EmailLog.created_at.desc(), EmailLog.id.desc())
    )
    return db.scalars(statement).all()
