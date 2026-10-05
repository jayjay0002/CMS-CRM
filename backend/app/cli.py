"""Admin commands. Usage: uv run python -m app.cli <command> [options]

seed-packages                               add the sample packages
seed-content                                add default site settings, theme and sections
apply-story                                 rewrite the page as the wagon's story (run once;
                                            overwrites the text of built-in sections)
setup-storage                               create the public image bucket in Supabase
create-owner --email EMAIL --name "NAME"    create an owner account (prompts for password)
"""

import argparse
import logging

from app.modules.auth.commands import create_owner
from app.modules.content.commands import apply_story_content, seed_content
from app.modules.media.commands import setup_storage
from app.modules.packages.commands import seed_packages


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("seed-packages", help="add the sample packages")
    commands.add_parser("seed-content", help="add default site settings, theme and sections")
    commands.add_parser(
        "apply-story",
        help="rewrite the page as the wagon's story (overwrites built-in section text)",
    )
    commands.add_parser("setup-storage", help="create the public image bucket in Supabase")
    owner = commands.add_parser("create-owner", help="create an owner account")
    owner.add_argument("--email", required=True)
    owner.add_argument("--name", required=True)
    return parser


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    args = build_parser().parse_args()
    if args.command == "seed-packages":
        seed_packages()
    elif args.command == "seed-content":
        seed_content()
    elif args.command == "apply-story":
        apply_story_content()
    elif args.command == "setup-storage":
        setup_storage()
    elif args.command == "create-owner":
        create_owner(args.email, args.name)


if __name__ == "__main__":
    main()
