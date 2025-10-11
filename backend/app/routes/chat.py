from fastapi import APIRouter
from app.models.message import UserMessage
from app.gemini_client import get_gemini_response
from app.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL

router = APIRouter()


@router.post("/chat")
async def chat(message: UserMessage):
    response_text = get_gemini_response(message.message)
    return {"response": response_text}


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "gemini_key_configured": bool(GEMINI_API_KEY),
        "model": GEMINI_MODEL,
        "fallback_model": GEMINI_FALLBACK_MODEL,
    }
