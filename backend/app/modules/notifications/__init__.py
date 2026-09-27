"""Notifications module: customer and business emails, sent via Resend and logged.

Public API for other modules. Callers pass plain data (BookingEmail, ProposalEmail), so this
module never depends on bookings or proposals.
"""

from app.modules.notifications.enums import EmailStatus, EmailTemplate
from app.modules.notifications.schemas import (
    BookingEmail,
    EmailLogRead,
    EmailRequest,
    ProposalEmail,
    ProposalEmailItem,
)
from app.modules.notifications.service import (
    EmailDispatcher,
    EmailDispatcherDep,
    get_email_dispatcher,
    list_email_log,
)

__all__ = [
    "BookingEmail",
    "EmailDispatcher",
    "EmailDispatcherDep",
    "EmailLogRead",
    "EmailRequest",
    "EmailStatus",
    "EmailTemplate",
    "ProposalEmail",
    "ProposalEmailItem",
    "get_email_dispatcher",
    "list_email_log",
]
