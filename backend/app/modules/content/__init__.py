"""Content module: editable landing-page sections and site-wide business info.

Public API for other modules.
"""

from app.modules.content.branding import Branding, get_branding

__all__ = ["Branding", "get_branding"]
