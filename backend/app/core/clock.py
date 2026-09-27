from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.core.config import settings


def business_today() -> date:
    return datetime.now(ZoneInfo(settings.business_timezone)).date()
