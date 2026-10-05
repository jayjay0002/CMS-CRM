"""Starting content for a fresh site: the wagon's story, following the printed brochure.

The Instagram handle is still a placeholder until the client confirms it.
"""

from typing import Any

from app.modules.content.enums import (
    BodyFont,
    CtaTarget,
    FlavorColor,
    HeadingFont,
    ImageSide,
    SectionType,
)

BOOK_LABEL = "Book the wagon"

DEFAULT_SETTINGS: dict[str, Any] = {
    "business_name": "The Red Popcorn Wagon",
    "tagline": "A restored 1907 popcorn wagon for events in metro Atlanta",
    "phone_display": "(404) 682-6707",
    "phone_e164": "+14046826707",
    "email": "info@theredpopcornwagon.com",
    "instagram_handle": "@theredpopcornwagon",
    "instagram_url": "https://instagram.com/theredpopcornwagon",
    "service_area": "Metro Atlanta, GA",
}

# In display order.
DEFAULT_SECTIONS: list[tuple[SectionType, dict[str, Any]]] = [
    (
        SectionType.HERO,
        {
            "headline": "A 1907 popcorn\nwagon, still\npopping.",
            "description": (
                "The Red Popcorn Wagon is a hand-restored 1907 Cretors Model D. We roll it to "
                "your event anywhere in metro Atlanta and serve hot, fresh popcorn and warm "
                "roasted peanuts straight from the wagon."
            ),
            "primary_cta_label": BOOK_LABEL,
            "secondary_cta_label": "See packages",
            "highlights": [
                "Hand-restored 1907 Cretors",
                "Popped fresh in front of guests",
                "Setup and cleanup included",
            ],
        },
    ),
    (
        SectionType.EVENT_TYPES,
        {
            "items": [
                "Special events",
                "Corporate events",
                "HOA & neighborhood events",
                "Backyard movie nights",
                "Weddings",
                "Birthday parties",
                "School fairs",
                "Grand openings",
            ]
        },
    ),
    (
        SectionType.PACKAGES_MENU,
        {
            "heading": "Pick your package",
            "description": (
                "Every package includes delivery inside I‑285, setup, bags for your guests "
                "and cleanup. Want something custom? Give us a call."
            ),
        },
    ),
    (
        SectionType.HOW_IT_WORKS,
        {
            "heading": "How booking works",
            "steps": [
                {
                    "title": "Pick a package and a date",
                    "body": (
                        "Send the booking form below. It takes about two minutes and nothing "
                        "is charged."
                    ),
                },
                {
                    "title": "We confirm within a day",
                    "body": (
                        "We call or email to go over the menu and the setup spot, then lock "
                        "in your date."
                    ),
                },
                {
                    "title": "We pop, you party",
                    "body": (
                        "We arrive 45 minutes early, roll the wagon into place, pop fresh all "
                        "event long and clean up after."
                    ),
                },
            ],
            "cta_label": BOOK_LABEL,
        },
    ),
    (
        SectionType.FLAVORS,
        {
            "heading": "Fresh from the wagon",
            "description": (
                "Hot popcorn, peanuts roasted right in the wagon, and a whirly lollipop for the "
                "road. Old-fashioned treats, served the way the park wagon served them."
            ),
            "items": [
                {"name": "Popcorn", "color": FlavorColor.BUTTER},
                {"name": "Roasted peanuts", "color": FlavorColor.CARAMEL},
                {"name": "Whirly lollipops", "color": FlavorColor.CHERRY},
            ],
        },
    ),
    (
        SectionType.FAQ,
        {
            "heading": "Good questions",
            "intro": "Something else on your mind? Call us.",
            "items": [
                {
                    "question": "Is the wagon really from 1907?",
                    "answer": (
                        "Yes. She's a 1907 Cretors Model D, restored by hand panel by panel. "
                        "Guests love watching the popcorn kettle work through the glass."
                    ),
                },
                {
                    "question": "Where do you travel?",
                    "answer": (
                        "Anywhere inside I‑285 is included. Farther out in metro Atlanta, "
                        "like Marietta, Alpharetta or Peachtree City, adds a travel fee that we "
                        "quote when we confirm."
                    ),
                },
                {
                    "question": "What does the wagon need on site?",
                    "answer": (
                        "A flat spot about 6 by 6 feet and one standard outlet within 50 feet. "
                        "No outlet? We can bring a quiet generator for outdoor events."
                    ),
                },
                {
                    "question": "Can the wagon be set up outdoors?",
                    "answer": (
                        "Yes. Outdoors we need a flat surface, and in the Georgia summer some "
                        "shade or a tent keeps the popcorn crisp."
                    ),
                },
                {
                    "question": "Can you bring a movie screen?",
                    "answer": (
                        "Yes. Ask about our portable movie screen and popcorn wagon package for "
                        "backyard and neighborhood movie nights. Call us for pricing."
                    ),
                },
                {
                    "question": "How far ahead should I book?",
                    "answer": (
                        "At least a day ahead. Saturdays in spring and fall fill up fast, so a "
                        "month or more ahead is safer for weddings."
                    ),
                },
                {
                    "question": "What about allergies?",
                    "answer": (
                        "We roast peanuts in the wagon and pop with butter, so the wagon isn't "
                        "nut-free or dairy-free. Tell us about any allergies in your booking "
                        "notes and we'll talk it through."
                    ),
                },
                {
                    "question": "How do I pay?",
                    "answer": (
                        "Nothing is charged when you send the form. We send payment details when "
                        "we confirm your booking."
                    ),
                },
            ],
        },
    ),
    (
        SectionType.BOOKING,
        {
            "heading": BOOK_LABEL,
            "description": (
                "Tell us about your event. We'll call or email within a day to confirm the "
                "details and lock in your date."
            ),
            "phone_prompt": "Rather talk it through?",
        },
    ),
]


# The launch look ("Classic Red Wagon"). Matches the @theme tokens in the frontend CSS.
DEFAULT_THEME: dict[str, Any] = {
    "colors": {
        "background": "#fffdf4",
        "surface": "#ffd447",
        "surface_soft": "#fff1b8",
        "text": "#1c1f4a",
        "primary": "#d7263d",
        "primary_dark": "#a61b2e",
        "accent": "#b86a1f",
    },
    "heading_font": HeadingFont.SHRIKHAND,
    "body_font": BodyFont.BRICOLAGE_GROTESQUE,
}

# Starting content when the owner adds a custom section; they edit it right away.
NEW_SECTION_CONTENT: dict[SectionType, dict[str, Any]] = {
    SectionType.STORY: {
        "heading": "Our story",
        "body": "Tell visitors how the wagon got rolling.",
        "image": None,
        "image_side": ImageSide.RIGHT,
    },
    SectionType.GALLERY: {"heading": "Photos from our events", "intro": "", "images": []},
    SectionType.TIMELINE: {"heading": "How the wagon came back", "intro": "", "chapters": []},
    SectionType.TEXT: {"heading": "A few words", "body": "Write anything you like here."},
    SectionType.CTA: {
        "heading": "Ready for fresh popcorn?",
        "body": "",
        "button_label": BOOK_LABEL,
        "button_target": CtaTarget.BOOK,
        "button_url": None,
    },
}
