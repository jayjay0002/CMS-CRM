from typing import Annotated, Any

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from app.core.constants import MAX_EMAIL_LENGTH, URL_MAX_LENGTH
from app.modules.content.constants import (
    BUSINESS_NAME_MAX_LENGTH,
    EVENT_TYPES_MAX_ITEMS,
    FAQ_ANSWER_MAX_LENGTH,
    FAQ_INTRO_MAX_LENGTH,
    FAQ_MAX_ITEMS,
    FAQ_QUESTION_MAX_LENGTH,
    FLAVORS_MAX_ITEMS,
    HEADING_MAX_LENGTH,
    HERO_DESCRIPTION_MAX_LENGTH,
    HERO_HEADLINE_MAX_LENGTH,
    HERO_HEADLINE_MAX_LINES,
    HERO_MAX_HIGHLIGHTS,
    HIGHLIGHT_MAX_LENGTH,
    INSTAGRAM_HANDLE_MAX_LENGTH,
    LABEL_MAX_LENGTH,
    PHONE_DISPLAY_MAX_LENGTH,
    PHONE_E164_PATTERN,
    SERVICE_AREA_MAX_LENGTH,
    SHORT_TEXT_MAX_LENGTH,
    STEPS_MAX_ITEMS,
    TAGLINE_MAX_LENGTH,
    WEB_URL_PATTERN,
)
from app.modules.content.enums import FlavorColor, SectionType


def _text(max_length: int, *, required: bool = True) -> StringConstraints:
    """Trimmed text up to max_length; required text can't be blank."""
    return StringConstraints(
        strip_whitespace=True, min_length=1 if required else 0, max_length=max_length
    )


def _limit_headline_lines(headline: str) -> str:
    if len(headline.splitlines()) > HERO_HEADLINE_MAX_LINES:
        raise ValueError(f"Keep the headline to {HERO_HEADLINE_MAX_LINES} lines or fewer")
    return headline


Heading = Annotated[str, _text(HEADING_MAX_LENGTH)]
Label = Annotated[str, _text(LABEL_MAX_LENGTH)]
ShortText = Annotated[str, _text(SHORT_TEXT_MAX_LENGTH)]
# Each line break starts a new animated line on the page.
Headline = Annotated[str, _text(HERO_HEADLINE_MAX_LENGTH), AfterValidator(_limit_headline_lines)]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


# ---------------------------------------------------------------- Section content


class HeroContent(StrictModel):
    headline: Headline
    description: Annotated[str, _text(HERO_DESCRIPTION_MAX_LENGTH)]
    primary_cta_label: Label
    secondary_cta_label: Label
    highlights: Annotated[
        list[Annotated[str, _text(HIGHLIGHT_MAX_LENGTH)]], Field(max_length=HERO_MAX_HIGHLIGHTS)
    ]


class EventTypesContent(StrictModel):
    items: Annotated[list[Label], Field(min_length=1, max_length=EVENT_TYPES_MAX_ITEMS)]


class PackagesMenuContent(StrictModel):
    heading: Heading
    description: ShortText


class Step(StrictModel):
    title: Heading
    body: ShortText


class HowItWorksContent(StrictModel):
    heading: Heading
    steps: Annotated[list[Step], Field(min_length=1, max_length=STEPS_MAX_ITEMS)]
    cta_label: Label


class Flavor(StrictModel):
    name: Label
    color: FlavorColor


class FlavorsContent(StrictModel):
    heading: Heading
    description: ShortText
    items: Annotated[list[Flavor], Field(min_length=1, max_length=FLAVORS_MAX_ITEMS)]


class FaqItem(StrictModel):
    question: Annotated[str, _text(FAQ_QUESTION_MAX_LENGTH)]
    answer: Annotated[str, _text(FAQ_ANSWER_MAX_LENGTH)]


class FaqContent(StrictModel):
    heading: Heading
    intro: Annotated[str, _text(FAQ_INTRO_MAX_LENGTH, required=False)]
    items: Annotated[list[FaqItem], Field(min_length=1, max_length=FAQ_MAX_ITEMS)]


class BookingContent(StrictModel):
    heading: Heading
    description: ShortText
    phone_prompt: Heading


CONTENT_MODELS: dict[SectionType, type[StrictModel]] = {
    SectionType.HERO: HeroContent,
    SectionType.EVENT_TYPES: EventTypesContent,
    SectionType.PACKAGES_MENU: PackagesMenuContent,
    SectionType.HOW_IT_WORKS: HowItWorksContent,
    SectionType.FLAVORS: FlavorsContent,
    SectionType.FAQ: FaqContent,
    SectionType.BOOKING: BookingContent,
}

# ---------------------------------------------------------------- Site settings


class SiteSettingsBody(StrictModel):
    business_name: Annotated[str, _text(BUSINESS_NAME_MAX_LENGTH)]
    tagline: Annotated[str, _text(TAGLINE_MAX_LENGTH)]
    phone_display: Annotated[str, _text(PHONE_DISPLAY_MAX_LENGTH)]
    phone_e164: Annotated[str, StringConstraints(strip_whitespace=True, pattern=PHONE_E164_PATTERN)]
    email: Annotated[EmailStr, Field(max_length=MAX_EMAIL_LENGTH)] | None = None
    instagram_handle: Annotated[str, _text(INSTAGRAM_HANDLE_MAX_LENGTH)] | None = None
    instagram_url: (
        Annotated[
            str,
            StringConstraints(
                strip_whitespace=True, max_length=URL_MAX_LENGTH, pattern=WEB_URL_PATTERN
            ),
        ]
        | None
    ) = None
    service_area: Annotated[str, _text(SERVICE_AREA_MAX_LENGTH)]


class SiteSettingsRead(SiteSettingsBody):
    model_config = ConfigDict(from_attributes=True, extra="ignore")


# ---------------------------------------------------------------- Sections API


class PublicSection(BaseModel):
    type: SectionType
    content: dict[str, Any]


class PublicSite(BaseModel):
    settings: SiteSettingsRead
    sections: list[PublicSection]


class AdminSection(BaseModel):
    type: SectionType
    position: int
    is_visible: bool
    content: dict[str, Any]


class VisibilityUpdate(StrictModel):
    is_visible: bool


class SectionOrderUpdate(StrictModel):
    types: list[SectionType]
