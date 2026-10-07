from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.grok_ai import ask_grok

router = APIRouter()

class AssistantRequest(BaseModel):
    question: str = Field(min_length=1, max_length=12000)
    context: str | None = Field(default=None, max_length=30000)

class AssistantResponse(BaseModel):
    answer: str
    model: str

@router.post("/chat", response_model=AssistantResponse)
def chat(request: AssistantRequest):
    import os
    return {
        "answer": ask_grok(request.question, request.context),
        "model": os.getenv("XAI_MODEL", "grok-4.7"),
    }
