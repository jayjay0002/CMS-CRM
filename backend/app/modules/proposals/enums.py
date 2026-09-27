from enum import StrEnum


class ProposalStatus(StrEnum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    # "Expired" isn't stored: it's a sent proposal whose valid_until has passed.
