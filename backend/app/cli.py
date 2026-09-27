"""Admin commands. Usage: uv run python -m app.cli <command>"""

import argparse
import logging
from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Package

logger = logging.getLogger(__name__)

# Starter menu for a fresh database. Prices are placeholders the owner edits in the admin panel.
SAMPLE_PACKAGES = [
    {
        "slug": "snack-stand",
        "name": "The Snack Stand",
        "description": "Classic butter popcorn for smaller parties and backyard birthdays.",
        "price": Decimal("295.00"),
        "servings": 100,
        "duration_hours": 2,
        "position": 1,
    },
    {
        "slug": "party-pop",
        "name": "The Party Pop",
        "description": (
            "Butter plus one flavor of your choice. "
            "Our most-booked package for weddings and showers."
        ),
        "price": Decimal("450.00"),
        "servings": 200,
        "duration_hours": 3,
        "position": 2,
    },
    {
        "slug": "main-event",
        "name": "The Main Event",
        "description": (
            "Three flavors, a custom sign with your names or logo, "
            "and an attendant for the whole event."
        ),
        "price": Decimal("695.00"),
        "servings": 350,
        "duration_hours": 4,
        "position": 3,
    },
]


def seed_packages() -> None:
    """Insert the sample packages that don't exist yet (safe to run more than once)."""
    with SessionLocal() as db:
        slugs = [package["slug"] for package in SAMPLE_PACKAGES]
        existing = set(db.scalars(select(Package.slug).where(Package.slug.in_(slugs))))
        missing = [package for package in SAMPLE_PACKAGES if package["slug"] not in existing]
        db.add_all(Package(**package) for package in missing)
        db.commit()
    logger.info("Added %d package(s); %d already existed", len(missing), len(existing))


COMMANDS = {"seed-packages": seed_packages}


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    parser.add_argument("command", choices=COMMANDS)
    args = parser.parse_args()
    COMMANDS[args.command]()


if __name__ == "__main__":
    main()
