"""Run the API against a local embedded Postgres (no Supabase needed).

Usage (from backend/):
  uv run python scripts/dev_local.py                    migrate, seed packages and serve the API
  uv run python scripts/dev_local.py <app.cli command>  run an admin command against the local DB,
      e.g. create-owner --email you@example.com --name "Your Name"

Data lives in backend/.devdb and survives restarts. Delete that folder to start fresh.
"""

import os
import subprocess
import sys
from pathlib import Path

import pgserver
import uvicorn

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / ".devdb"
API_PORT = 8000


def run_module(*args: str) -> None:
    subprocess.run([sys.executable, "-m", *args], cwd=BACKEND_DIR, env=os.environ, check=True)


def main() -> None:
    server = pgserver.get_server(DATA_DIR, cleanup_mode="stop")
    # Must be set before the app (and its settings) are imported.
    os.environ["DATABASE_URL"] = server.get_uri()

    run_module("alembic", "upgrade", "head")

    cli_args = sys.argv[1:]
    if cli_args:
        run_module("app.cli", *cli_args)
        return

    run_module("app.cli", "seed-packages")

    uvicorn.run("app.main:app", app_dir=str(BACKEND_DIR), port=API_PORT)


if __name__ == "__main__":
    main()
