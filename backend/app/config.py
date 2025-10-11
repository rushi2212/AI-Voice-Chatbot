import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_env(value: str | None) -> str | None:
    if value is None:
        return None
    v = value.strip().strip('"').strip("'")
    return v if v else None


raw_key = os.getenv("GEMINI_API_KEY")
# Normalize by stripping surrounding quotes/whitespace that may be present in .env
GEMINI_API_KEY = _normalize_env(raw_key)

# Model configuration (override via .env). Defaults to a fast model.
GEMINI_MODEL = _normalize_env(os.getenv("GEMINI_MODEL")) or "gemini-2.5-flash"

# Optional fallback model to try if the primary model returns RESOURCE_EXHAUSTED (429).
GEMINI_FALLBACK_MODEL = _normalize_env(os.getenv("GEMINI_FALLBACK_MODEL"))
