"""Starting content for a fresh site: the text the landing page launched with.

Phone, email and Instagram are placeholders until the client confirms them.
"""

from typing import Any

from app.modules.content.enums import FlavorColor, SectionType

DEFAULT_SETTINGS: dict[str, Any] = {
    "business_name": "The Red Popcorn Wagon",
    "tagline": "Popcorn carts for events in metro Atlanta",
    "phone_display": "(404) 555-0147",
    "phone_e164": "+14045550147",
    "email": "hello@theredpopcornwagon.com",
    "instagram_handle": "@theredpopcornwagon",
    "instagram_url": "https://instagram.com/theredpopcornwagon",
    "service_area": "Metro Atlanta, GA",
}

# In display order.
DEFAULT_SECTIONS: list[tuple[SectionType, dict[str, Any]]] = [
    (
        SectionType.HERO,
        {
            "headline": "Fresh popcorn,\npopped right\nat your party.",
            "description": (
                "We roll our vintage popcorn cart to weddings, birthdays and office parties "
                "across metro Atlanta, and pop it fresh while your guests watch."
            ),
            "primary_cta_label": "Book the cart",
            "secondary_cta_label": "See packages",
            "highlights": [
                "Setup and cleanup included",
                "Popped fresh in front of guests",
                "All over metro Atlanta",
            ],
        },
    ),
    (
        SectionType.EVENT_TYPES,
        {
            "items": [
                "Weddings",
                "Birthday parties",
                "Office parties",
                "School fairs",
                "Baby showers",
                "Backyard movie nights",
                "Grand openings",
            ]
        },
    ),
    (
        SectionType.PACKAGES_MENU,
        {
            "heading": "The menu",
            "description": (
                "Every package includes delivery inside I‑285, setup, bags for your guests "
                "and cleanup."
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
                        "We call or email to go over the flavors and the setup spot, then lock "
                        "in your date."
                    ),
                },
                {
                    "title": "We pop, you party",
                    "body": (
                        "We arrive 45 minutes early, set up the cart, pop fresh all event long "
                        "and clean up after."
                    ),
                },
            ],
            "cta_label": "Book the cart",
        },
    ),
    (
        SectionType.FLAVORS,
        {
            "heading": "Pick your flavors",
            "description": (
                "Every package starts with classic butter. Bigger packages add more flavors, "
                "and we can match the bags to your wedding colors."
            ),
            "items": [
                {"name": "Classic butter", "color": FlavorColor.BUTTER},
                {"name": "Kettle corn", "color": FlavorColor.KERNEL},
                {"name": "Salted caramel", "color": FlavorColor.CARAMEL},
                {"name": "White cheddar", "color": FlavorColor.BUTTER_SOFT},
                {"name": "Chicago mix", "color": FlavorColor.INK},
                {"name": "Cinnamon sugar", "color": FlavorColor.CHERRY},
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
                    "question": "Where do you travel?",
                    "answer": (
                        "Anywhere inside I‑285 is included. Farther out in metro Atlanta, "
                        "like Marietta, Alpharetta or Peachtree City, adds a travel fee that we "
                        "quote when we confirm."
                    ),
                },
                {
                    "question": "What does the cart need on site?",
                    "answer": (
                        "A flat spot about 6 by 6 feet and one standard outlet within 50 feet. "
                        "No outlet? We can bring a quiet generator for outdoor events."
                    ),
                },
                {
                    "question": "Can the cart be set up outdoors?",
                    "answer": (
                        "Yes. Outdoors we need a flat surface, and in the Georgia summer some "
                        "shade or a tent keeps the popcorn crisp."
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
                        "We pop in coconut oil. White cheddar and Chicago mix contain dairy. Tell "
                        "us about any allergies in your booking notes and we will plan around them."
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
            "heading": "Book the cart",
            "description": (
                "Tell us about your event. We'll call or email within a day to confirm the "
                "details and lock in your date."
            ),
            "phone_prompt": "Rather talk it through?",
        },
    ),
]
