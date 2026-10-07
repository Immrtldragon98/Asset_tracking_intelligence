from fastapi import APIRouter
from pydantic import BaseModel, Field
import os

from app.services.grok_ai import ask_groq

router = APIRouter()

class AssistantRequest(BaseModel):
    question: str = Field(min_length=1, max_length=12000)
    context: str | None = Field(default=None, max_length=30000)

class AssistantResponse(BaseModel):
    answer: str
    model: str

@router.post("/chat", response_model=AssistantResponse)
def chat(request: AssistantRequest):
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    return {
        "answer": ask_groq(request.question, request.context),
        "model": model,
    }
