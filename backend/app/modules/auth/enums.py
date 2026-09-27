from enum import StrEnum


class AdminStatus(StrEnum):
    ACTIVE = "active"
    # Invited but hasn't signed in yet.
    INVITED = "invited"
    DEACTIVATED = "deactivated"


class AuthLinkType(StrEnum):
    """Supabase generate_link types we use."""

    INVITE = "invite"
    RECOVERY = "recovery"


class AdminRole(StrEnum):
    OWNER = "owner"
    STAFF = "staff"
