"""The wagon's story: the sections `apply-story` adds, told in the founder's words.

The text follows the printed brochure. People, places and restoration dates are left out on
purpose; the owner can add them in the admin panel.
"""

from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.modules.content.defaults import BOOK_LABEL
from app.modules.content.enums import CtaTarget, ImageSide, SectionType

STORY_PHOTOS_DIR = Path(__file__).parent / "story_photos"

# Settings fields that change to the brochure's facts (values come from DEFAULT_SETTINGS).
STORY_SETTING_FIELDS = ("tagline", "phone_display", "phone_e164", "email")


@dataclass(frozen=True)
class StoryPhoto:
    file_name: str
    alt: str


EVENT_PHOTO = StoryPhoto(
    "evening-event.jpg",
    "The Red Popcorn Wagon lit up at an evening event, with the owner in a striped vest "
    "and costumed characters.",
)
BARE_FRAME_PHOTO = StoryPhoto(
    "bare-frame.jpg", "The wagon stripped to a bare steel frame on a dolly in the workshop."
)
PINSTRIPING_PHOTO = StoryPhoto(
    "pinstriping.jpg", "A craftsman painting gold pinstripes by hand on the red side panels."
)
CABINETS_PHOTO = StoryPhoto(
    "cabinets.jpg",
    "Oak-framed glass cabinets with Buttered Corn and Pure Food signs on the red wagon body.",
)
FIRST_ROLL_PHOTO = StoryPhoto(
    "first-roll.jpg",
    "The finished wagon with yellow wheels and a striped awning on a snowy driveway.",
)
HEADED_SOUTH_PHOTO = StoryPhoto(
    "headed-south.jpg", "The restored wagon rolling up ramps into a semi trailer."
)

STORY_PHOTOS = (
    EVENT_PHOTO,
    BARE_FRAME_PHOTO,
    PINSTRIPING_PHOTO,
    CABINETS_PHOTO,
    FIRST_ROLL_PHOTO,
    HEADED_SOUTH_PHOTO,
)

STORY_BODY = """\
When I was a kid, my parents took us to the park downtown every week to get "the really \
good popcorn." Those trips left me with some of my fondest memories of time with my family, \
and nothing brings them back like the smell of fresh popcorn drifting through the air.

When I retired, I realized there was no better way to share that feeling with today's world \
than to bring those same classic flavors to others. So I found a 1907 Cretors Model D popcorn \
wagon that needed a lot of love, and brought her back.

Today she rolls up to parties, neighborhood events and office gatherings across metro \
Atlanta, popping hot, fresh popcorn and roasting warm peanuts the way it was done more than a \
century ago. Come take a step back in time with us."""

# (kicker, title, body, photo) in reading order.
CHAPTERS: tuple[tuple[str, str, str, StoryPhoto], ...] = (
    (
        "Chapter 1",
        "Down to the bones",
        "She arrived as a bare steel frame with a rusted belly and not one window. Before "
        "anything could pop, every rivet and brace had to be checked, straightened and made "
        "road-worthy again.",
        BARE_FRAME_PHOTO,
    ),
    (
        "Chapter 2",
        "Wagon red, line by line",
        "Coat after coat of deep wagon red went on. Then came the gold pinstripes, painted "
        "freehand one panel at a time, just as they were in 1907.",
        PINSTRIPING_PHOTO,
    ),
    (
        "Chapter 3",
        "Oak, glass and chrome",
        "Oak-framed cabinets, glass panes and polished hoods for the peanut roaster went back "
        "in, along with the old signs promising buttered corn and pure food.",
        CABINETS_PHOTO,
    ),
    (
        "Chapter 4",
        "The first roll",
        "On a bright, snowy morning she rolled out of the shop finished: yellow spoked "
        "wheels, a striped awning and a sign promising fresh roasted peanuts.",
        FIRST_ROLL_PHOTO,
    ),
    (
        "Chapter 5",
        "Headed south",
        "Then up the ramps and into a trailer for the long trip to her new home in Atlanta, "
        "where she's been popping at parties ever since.",
        HEADED_SOUTH_PHOTO,
    ),
)


def _image(photo: StoryPhoto, photo_urls: Mapping[str, str]) -> dict[str, str]:
    return {"url": photo_urls[photo.file_name], "alt": photo.alt}


def story_sections(photo_urls: Mapping[str, str]) -> list[tuple[SectionType, dict[str, Any]]]:
    """Story, Timeline and closing CTA content, given each photo's uploaded URL by file name."""
    story = {
        "heading": "The really good popcorn",
        "body": STORY_BODY,
        "image": _image(EVENT_PHOTO, photo_urls),
        "image_side": ImageSide.RIGHT,
    }
    timeline = {
        "heading": "From bare frame to Atlanta",
        "intro": (
            "Every panel, pinstripe and pane of glass went back on by hand. "
            "Here's how she came back to life."
        ),
        "chapters": [
            {"kicker": kicker, "title": title, "body": body, "image": _image(photo, photo_urls)}
            for kicker, title, body, photo in CHAPTERS
        ],
    }
    cta = {
        "heading": "Step back into yesteryear",
        "body": (
            "Fresh popcorn, warm roasted peanuts and a 1907 wagon your guests will talk about "
            "long after the party."
        ),
        "button_label": BOOK_LABEL,
        "button_target": CtaTarget.BOOK,
        "button_url": None,
    }
    return [(SectionType.STORY, story), (SectionType.TIMELINE, timeline), (SectionType.CTA, cta)]
