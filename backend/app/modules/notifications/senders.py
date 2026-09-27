from typing import Protocol

import httpx2

from app.modules.notifications.constants import (
    RESEND_API_URL,
    RESEND_REQUEST_TIMEOUT_SECONDS,
)
from app.modules.notifications.schemas import OutgoingEmail


class EmailSender(Protocol):
    def send(self, email: OutgoingEmail) -> str:
        """Delivers the email and returns the provider's message id. Raises on failure."""
        ...


class ResendSender:
    def __init__(self, api_key: str, http: httpx2.Client | None = None) -> None:
        self._headers = {"Authorization": f"Bearer {api_key}"}
        self._http = http or httpx2.Client(timeout=RESEND_REQUEST_TIMEOUT_SECONDS)

    def send(self, email: OutgoingEmail) -> str:
        payload: dict[str, object] = {
            "from": email.from_address,
            "to": [email.to_address],
            "subject": email.subject,
            "html": email.html,
            "text": email.text,
        }
        if email.reply_to:
            payload["reply_to"] = email.reply_to
        response = self._http.post(RESEND_API_URL, headers=self._headers, json=payload)
        if response.is_error:
            raise RuntimeError(f"Resend returned {response.status_code}: {response.text}")
        return str(response.json()["id"])
