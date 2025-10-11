from google import genai
from fastapi import HTTPException
from .config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL

# Initialize the client once using the API key from environment
if not GEMINI_API_KEY or GEMINI_API_KEY.strip() == "" or GEMINI_API_KEY == "YOUR_API_KEY":
    # Fail fast with a clear message if the key isn't configured
    raise RuntimeError(
        "GEMINI_API_KEY is not set or invalid. Add it to backend/.env and restart the server."
    )

_client = genai.Client(api_key=GEMINI_API_KEY)


def _generate(model: str, contents: str):
    return _client.models.generate_content(model=model, contents=contents)


def get_gemini_response(user_message: str) -> str:
    try:
        response = _generate(GEMINI_MODEL, user_message)
        return response.text
    except Exception as e:  # Catch google.genai errors and surface as HTTP error
        message = str(e)
        if "API key not valid" in message or "API_KEY_INVALID" in message:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid Gemini API key. Create a new key in Google AI Studio "
                    "and set GEMINI_API_KEY in backend/.env, then restart the server."
                ),
            )
        if "RESOURCE_EXHAUSTED" in message or "quota" in message.lower() or "429" in message:
            # Attempt fallback model if configured
            if GEMINI_FALLBACK_MODEL:
                try:
                    response = _generate(GEMINI_FALLBACK_MODEL, user_message)
                    return response.text
                except Exception:
                    pass
            # Surface a 429 with retry-after header for the client
            raise HTTPException(
                status_code=429,
                detail=(
                    "Rate limit or quota exceeded for the configured model. "
                    "Please retry later or configure a different model/billing."
                ),
                headers={"Retry-After": "20"},
            )
        raise HTTPException(
            status_code=500, detail=f"Gemini request failed: {message}")
