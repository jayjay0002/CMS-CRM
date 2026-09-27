from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PackageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    description: str
    # Serialized as a string ("450.00") so no precision is lost in JSON.
    price: Decimal
    servings: int
    duration_hours: int
    image_url: str | None
