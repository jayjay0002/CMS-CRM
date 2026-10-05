from typing import Annotated, Any, Self

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    StringConstraints,
    model_validator,
)

from app.core.constants import MAX_EMAIL_LENGTH, URL_MAX_LENGTH
from app.modules.content.constants import (
    BUSINESS_NAME_MAX_LENGTH,
    CTA_BODY_MAX_LENGTH,
    EVENT_TYPES_MAX_ITEMS,
    FAQ_ANSWER_MAX_LENGTH,
    FAQ_INTRO_MAX_LENGTH,
    FAQ_MAX_ITEMS,
    FAQ_QUESTION_MAX_LENGTH,
    FLAVORS_MAX_ITEMS,
    GALLERY_MAX_IMAGES,
    HEADING_MAX_LENGTH,
    HERO_DESCRIPTION_MAX_LENGTH,
    HERO_HEADLINE_MAX_LENGTH,
    HERO_HEADLINE_MAX_LINES,
    HERO_MAX_HIGHLIGHTS,
    HEX_COLOR_PATTERN,
    HIGHLIGHT_MAX_LENGTH,
    HTTPS_URL_PATTERN,
    IMAGE_ALT_MAX_LENGTH,
    IMAGE_CAPTION_MAX_LENGTH,
    INSTAGRAM_HANDLE_MAX_LENGTH,
    LABEL_MAX_LENGTH,
    PHONE_DISPLAY_MAX_LENGTH,
    PHONE_E164_PATTERN,
    SERVICE_AREA_MAX_LENGTH,
    SHORT_TEXT_MAX_LENGTH,
    STEPS_MAX_ITEMS,
    STORY_BODY_MAX_LENGTH,
    TAGLINE_MAX_LENGTH,
    TEXT_BODY_MAX_LENGTH,
    TIMELINE_CHAPTER_BODY_MAX_LENGTH,
    TIMELINE_MAX_CHAPTERS,
    WEB_URL_PATTERN,
)
from app.modules.content.enums import (
    BodyFont,
    CtaTarget,
    FlavorColor,
    HeadingFont,
    ImageSide,
    SectionType,
)
from app.modules.media import is_hosted_image_url
from app.modules.packages import PACKAGE_SLUG_MAX_LENGTH


def _text(max_length: int, *, required: bool = True) -> StringConstraints:
    """Trimmed text up to max_length; required text can't be blank."""
    return StringConstraints(
        strip_whitespace=True, min_length=1 if required else 0, max_length=max_length
    )


def _limit_headline_lines(headline: str) -> str:
    if len(headline.splitlines()) > HERO_HEADLINE_MAX_LINES:
        raise ValueError(f"Keep the headline to {HERO_HEADLINE_MAX_LINES} lines or fewer")
    return headline


def _require_hosted_image(url: str) -> str:
    if not is_hosted_image_url(url):
        raise ValueError("Use an image uploaded through the admin panel")
    return url


Heading = Annotated[str, _text(HEADING_MAX_LENGTH)]
Label = Annotated[str, _text(LABEL_MAX_LENGTH)]
ShortText = Annotated[str, _text(SHORT_TEXT_MAX_LENGTH)]
# Each line break starts a new animated line on the page.
Headline = Annotated[str, _text(HERO_HEADLINE_MAX_LENGTH), AfterValidator(_limit_headline_lines)]
HostedImageUrl = Annotated[str, _text(URL_MAX_LENGTH), AfterValidator(_require_hosted_image)]
HexColor = Annotated[str, StringConstraints(strip_whitespace=True, pattern=HEX_COLOR_PATTERN)]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Image(StrictModel):
    url: HostedImageUrl
    # Describes the picture for screen readers and when it fails to load.
    alt: Annotated[str, _text(IMAGE_ALT_MAX_LENGTH)]


class CaptionedImage(Image):
    caption: Annotated[str, _text(IMAGE_CAPTION_MAX_LENGTH, required=False)] = ""


# ---------------------------------------------------------------- Built-in section content


class HeroContent(StrictModel):
    headline: Headline
    description: Annotated[str, _text(HERO_DESCRIPTION_MAX_LENGTH)]
    primary_cta_label: Label
    secondary_cta_label: Label
    highlights: Annotated[
        list[Annotated[str, _text(HIGHLIGHT_MAX_LENGTH)]], Field(max_length=HERO_MAX_HIGHLIGHTS)
    ]
    # A photo instead of the drawn popcorn cart; None keeps the drawing.
    image: Image | None = None


class EventTypesContent(StrictModel):
    items: Annotated[list[Label], Field(min_length=1, max_length=EVENT_TYPES_MAX_ITEMS)]


class PackagesMenuContent(StrictModel):
    heading: Heading
    description: ShortText
    # The package marked "Most popular" on the menu; None marks none. A slug that no longer
    # matches an active package simply shows no mark, so deleting a package can't break the page.
    featured_package_slug: Annotated[str, _text(PACKAGE_SLUG_MAX_LENGTH)] | None = None


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


# ---------------------------------------------------------------- Custom section content


class StoryContent(StrictModel):
    heading: Heading
    # Plain text; blank lines separate paragraphs.
    body: Annotated[str, _text(STORY_BODY_MAX_LENGTH)]
    image: Image | None = None
    image_side: ImageSide = ImageSide.RIGHT


class GalleryContent(StrictModel):
    heading: Heading
    intro: Annotated[str, _text(SHORT_TEXT_MAX_LENGTH, required=False)] = ""
    # Empty is allowed while the section is being set up; empty galleries aren't shown publicly.
    images: Annotated[list[CaptionedImage], Field(max_length=GALLERY_MAX_IMAGES)]


class TimelineChapter(StrictModel):
    kicker: Label
    title: Heading
    body: Annotated[str, _text(TIMELINE_CHAPTER_BODY_MAX_LENGTH)]
    image: Image


class TimelineContent(StrictModel):
    heading: Heading
    intro: Annotated[str, _text(SHORT_TEXT_MAX_LENGTH, required=False)] = ""
    # Empty while being set up; an empty timeline isn't shown publicly (like galleries).
    chapters: Annotated[list[TimelineChapter], Field(max_length=TIMELINE_MAX_CHAPTERS)]


class TextContent(StrictModel):
    heading: Heading
    body: Annotated[str, _text(TEXT_BODY_MAX_LENGTH)]


class CtaContent(StrictModel):
    heading: Heading
    body: Annotated[str, _text(CTA_BODY_MAX_LENGTH, required=False)] = ""
    button_label: Label
    button_target: CtaTarget = CtaTarget.BOOK
    button_url: (
        Annotated[
            str,
            StringConstraints(
                strip_whitespace=True, max_length=URL_MAX_LENGTH, pattern=HTTPS_URL_PATTERN
            ),
        ]
        | None
    ) = None

    @model_validator(mode="after")
    def url_needed_for_links(self) -> Self:
        if self.button_target is CtaTarget.URL and not self.button_url:
            raise ValueError("Add the link (https://...) the button should open")
        return self


CONTENT_MODELS: dict[SectionType, type[StrictModel]] = {
    SectionType.HERO: HeroContent,
    SectionType.EVENT_TYPES: EventTypesContent,
    SectionType.PACKAGES_MENU: PackagesMenuContent,
    SectionType.HOW_IT_WORKS: HowItWorksContent,
    SectionType.FLAVORS: FlavorsContent,
    SectionType.FAQ: FaqContent,
    SectionType.BOOKING: BookingContent,
    SectionType.STORY: StoryContent,
    SectionType.GALLERY: GalleryContent,
    SectionType.TIMELINE: TimelineContent,
    SectionType.TEXT: TextContent,
    SectionType.CTA: CtaContent,
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


# ---------------------------------------------------------------- Theme


class ThemeColors(StrictModel):
    """Color roles, named after the design tokens they replace."""

    background: HexColor  # page background (kernel)
    surface: HexColor  # hero/header band (butter)
    surface_soft: HexColor  # soft band, glow (butter-soft)
    text: HexColor  # main text and outlines (ink)
    primary: HexColor  # buttons and accents (cherry)
    primary_dark: HexColor  # shadows and error text (cherry-deep)
    accent: HexColor  # popcorn outline, warm accent (caramel)


class ThemeBody(StrictModel):
    colors: ThemeColors
    heading_font: HeadingFont
    body_font: BodyFont


class ThemeRead(ThemeBody):
    model_config = ConfigDict(from_attributes=True, extra="ignore")


# ---------------------------------------------------------------- Sections API


class PublicSection(BaseModel):
    id: int
    type: SectionType
    content: dict[str, Any]


class PublicSite(BaseModel):
    settings: SiteSettingsRead
    theme: ThemeRead
    sections: list[PublicSection]


class AdminSection(BaseModel):
    id: int
    type: SectionType
    position: int
    is_visible: bool
    # Custom sections can be deleted; built-in ones can only be hidden.
    is_removable: bool
    content: dict[str, Any]


class SectionCreate(StrictModel):
    type: SectionType


class VisibilityUpdate(StrictModel):
    is_visible: bool


class SectionOrderUpdate(StrictModel):
    ids: list[int]
