RESEND_API_URL = "https://api.resend.com/emails"
RESEND_REQUEST_TIMEOUT_SECONDS = 15

SUBJECT_MAX_LENGTH = 300
PROVIDER_ID_MAX_LENGTH = 100
# Stored error text is trimmed so a huge provider response can't bloat the log.
ERROR_MAX_LENGTH = 500

NOT_CONFIGURED = "Email isn't set up yet (RESEND_API_KEY is missing)"
NO_RECIPIENT = "No recipient address"
