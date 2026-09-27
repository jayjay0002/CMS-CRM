from enum import StrEnum


class SectionType(StrEnum):
    HERO = "hero"
    EVENT_TYPES = "event_types"
    PACKAGES_MENU = "packages_menu"
    HOW_IT_WORKS = "how_it_works"
    FLAVORS = "flavors"
    FAQ = "faq"
    BOOKING = "booking"


# Every "Book" button scrolls to the booking section, and the page needs a top.
ALWAYS_VISIBLE_SECTIONS = frozenset({SectionType.HERO, SectionType.BOOKING})


class FlavorColor(StrEnum):
    BUTTER = "butter"
    KERNEL = "kernel"
    CARAMEL = "caramel"
    BUTTER_SOFT = "butter_soft"
    INK = "ink"
    CHERRY = "cherry"
