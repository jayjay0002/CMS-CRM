from decimal import Decimal

from sqlalchemy import CheckConstraint, Index, Numeric, String, Text, true
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import (
    MONEY_PRECISION,
    MONEY_SCALE,
    PACKAGE_NAME_MAX_LENGTH,
    PACKAGE_SLUG_MAX_LENGTH,
    URL_MAX_LENGTH,
)
from app.db.base import Base, TimestampMixin


class Package(TimestampMixin, Base):
    __tablename__ = "packages"
    __table_args__ = (
        CheckConstraint("price >= 0", name="price_not_negative"),
        CheckConstraint("servings > 0", name="servings_positive"),
        CheckConstraint("duration_hours > 0", name="duration_hours_positive"),
        # Public menu query: active packages in display order.
        Index("ix_packages_is_active_position", "is_active", "position"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(PACKAGE_NAME_MAX_LENGTH))
    slug: Mapped[str] = mapped_column(String(PACKAGE_SLUG_MAX_LENGTH), unique=True)
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[Decimal] = mapped_column(Numeric(MONEY_PRECISION, MONEY_SCALE))
    servings: Mapped[int]
    duration_hours: Mapped[int]
    image_url: Mapped[str | None] = mapped_column(String(URL_MAX_LENGTH))
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())
    position: Mapped[int] = mapped_column(default=0, server_default="0")
