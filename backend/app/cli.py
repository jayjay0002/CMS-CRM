"""Admin commands. Usage: uv run python -m app.cli <command> [options]

seed-packages                               add the sample packages
seed-content                                add default site settings and landing sections
create-owner --email EMAIL --name "NAME"    create an owner account (prompts for password)
"""

import argparse
import logging

from app.modules.auth.commands import create_owner
from app.modules.content.commands import seed_content
from app.modules.packages.commands import seed_packages


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("seed-packages", help="add the sample packages")
    commands.add_parser("seed-content", help="add default site settings and landing sections")
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
    elif args.command == "create-owner":
        create_owner(args.email, args.name)


if __name__ == "__main__":
    main()
