"""Turns an EmailRequest into subject + HTML + plain text using the Jinja2 templates."""

from dataclasses import dataclass
from datetime import date, time
from decimal import Decimal
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from app.modules.content import Branding
from app.modules.notifications.enums import EmailTemplate
from app.modules.notifications.schemas import EmailRequest

TEMPLATES_DIR = Path(__file__).parent / "templates"

_environment = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    # HTML is escaped; the .txt versions are plain text and must not be.
    autoescape=select_autoescape(enabled_extensions=("html",), default_for_string=False),
    undefined=StrictUndefined,
    trim_blocks=True,
    lstrip_blocks=True,
)


def format_long_date(value: date) -> str:
    """Saturday, October 18, 2026"""
    return f"{value:%A, %B} {value.day}, {value.year}"


def format_time(value: time) -> str:
    """6:30 PM"""
    return value.strftime("%I:%M %p").lstrip("0")


def format_money(value: Decimal) -> str:
    return f"${value:,.2f}"


_environment.filters["long_date"] = format_long_date
_environment.filters["clock"] = format_time
_environment.filters["money"] = format_money


@dataclass(frozen=True)
class RenderedEmail:
    subject: str
    html: str
    text: str


def _subject(request: EmailRequest, branding: Branding) -> str:
    booking = request.booking
    match request.template:
        case EmailTemplate.BOOKING_RECEIVED:
            return f"We got your booking request ({booking.reference})"
        case EmailTemplate.BOOKING_APPROVED:
            return (
                f"You're booked! {booking.package_name} on {format_long_date(booking.event_date)}"
            )
        case EmailTemplate.BOOKING_DECLINED:
            return f"About your booking request ({booking.reference})"
        case EmailTemplate.PROPOSAL_SENT:
            return f"Your proposal from {branding.business_name} ({booking.reference})"
        case EmailTemplate.PROPOSAL_RESPONSE:
            verb = "accepted" if request.proposal and request.proposal.accepted else "declined"
            return f"{booking.customer_name} {verb} the proposal for {booking.reference}"


def render_email(request: EmailRequest, branding: Branding) -> RenderedEmail:
    context = {
        "brand": branding,
        "booking": request.booking,
        "proposal": request.proposal,
        "message": request.message,
    }
    name = request.template.value
    return RenderedEmail(
        subject=_subject(request, branding),
        html=_environment.get_template(f"{name}.html").render(context),
        text=_environment.get_template(f"{name}.txt").render(context),
    )
