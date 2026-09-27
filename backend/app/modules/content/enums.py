from enum import StrEnum


class SectionType(StrEnum):
    # Built-in sections: exactly one of each on the page; they can be hidden but not deleted.
    HERO = "hero"
    EVENT_TYPES = "event_types"
    PACKAGES_MENU = "packages_menu"
    HOW_IT_WORKS = "how_it_works"
    FLAVORS = "flavors"
    FAQ = "faq"
    BOOKING = "booking"
    # Custom sections: the owner can add as many as they like and delete them.
    STORY = "story"
    GALLERY = "gallery"
    TEXT = "text"
    CTA = "cta"


CUSTOM_SECTIONS = frozenset(
    {SectionType.STORY, SectionType.GALLERY, SectionType.TEXT, SectionType.CTA}
)
BUILT_IN_SECTIONS = frozenset(set(SectionType) - CUSTOM_SECTIONS)

# Every "Book" button scrolls to the booking section, and the page needs a top.
ALWAYS_VISIBLE_SECTIONS = frozenset({SectionType.HERO, SectionType.BOOKING})


class FlavorColor(StrEnum):
    BUTTER = "butter"
    KERNEL = "kernel"
    CARAMEL = "caramel"
    BUTTER_SOFT = "butter_soft"
    INK = "ink"
    CHERRY = "cherry"


class ImageSide(StrEnum):
    LEFT = "left"
    RIGHT = "right"


class CtaTarget(StrEnum):
    BOOK = "book"
    URL = "url"


class HeadingFont(StrEnum):
    """Display fonts offered in the theme editor (all on Google Fonts)."""

    SHRIKHAND = "Shrikhand"
    LILITA_ONE = "Lilita One"
    TITAN_ONE = "Titan One"
    BAGEL_FAT_ONE = "Bagel Fat One"
    DM_SERIF_DISPLAY = "DM Serif Display"
    FRAUNCES = "Fraunces"


class BodyFont(StrEnum):
    BRICOLAGE_GROTESQUE = "Bricolage Grotesque"
    NUNITO = "Nunito"
    WORK_SANS = "Work Sans"
    DM_SANS = "DM Sans"
    LORA = "Lora"
    FIGTREE = "Figtree"
