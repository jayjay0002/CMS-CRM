import pytest

from app.core.config import Settings

VERCEL_ORIGIN = "https://red-popcorn-wagon.vercel.app"
OWN_DOMAIN = "https://theredpopcornwagon.com"


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        (f'["{VERCEL_ORIGIN}"]', [VERCEL_ORIGIN]),
        (VERCEL_ORIGIN, [VERCEL_ORIGIN]),
        (f"{VERCEL_ORIGIN}/", [VERCEL_ORIGIN]),
        (f"{VERCEL_ORIGIN}, {OWN_DOMAIN}/", [VERCEL_ORIGIN, OWN_DOMAIN]),
        (f'["{VERCEL_ORIGIN}/", "{OWN_DOMAIN}"]', [VERCEL_ORIGIN, OWN_DOMAIN]),
        (f"[{VERCEL_ORIGIN}/]", [VERCEL_ORIGIN]),
        (f"[{VERCEL_ORIGIN}, {OWN_DOMAIN}]", [VERCEL_ORIGIN, OWN_DOMAIN]),
        ("[]", []),
        ("", []),
    ],
)
def test_cors_origins_accepts_json_or_plain_urls(
    monkeypatch: pytest.MonkeyPatch, raw: str, expected: list[str]
) -> None:
    monkeypatch.setenv("CORS_ORIGINS", raw)
    assert Settings(_env_file=None).cors_origins == expected
