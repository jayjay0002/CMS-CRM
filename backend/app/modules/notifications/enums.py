from enum import StrEnum


class EmailTemplate(StrEnum):
    BOOKING_RECEIVED = "booking_received"
    BOOKING_APPROVED = "booking_approved"
    BOOKING_DECLINED = "booking_declined"
    PROPOSAL_SENT = "proposal_sent"
    # To the business, when a customer accepts or declines a proposal.
    PROPOSAL_RESPONSE = "proposal_response"


class EmailStatus(StrEnum):
    SENT = "sent"
    FAILED = "failed"
    # Not attempted: email isn't configured or there was no recipient.
    SKIPPED = "skipped"
