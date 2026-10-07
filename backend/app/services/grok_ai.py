import os
import requests
from fastapi import HTTPException

XAI_URL = "https://api.x.ai/v1/chat/completions"

SYSTEM_PROMPT = """You are the Asset Tracking Intelligence maintenance assistant for an industrial plant.
Help maintenance planners investigate assets, failures, PM history, component life, reliability and operating observations.
Be practical and evidence-driven. Never invent plant data. If the supplied context is insufficient, clearly say what data is missing.
When giving a diagnosis, separate observed facts, likely causes, confidence, and recommended checks.
Do not issue commands that directly mutate the database."""
 
def ask_grok(question: str, context: str | None = None) -> str:
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Grok AI is not configured. Set XAI_API_KEY on the backend.")

    model = os.getenv("XAI_MODEL", "grok-4.7")
    user_content = question
    if context:
        user_content = f"Plant asset context:\n{context}\n\nQuestion:\n{question}"

    response = requests.post(
        XAI_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            "stream": False,
        },
        timeout=120,
    )
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Grok API error: {response.text[:500]}")

    data = response.json()
    return data["choices"][0]["message"]["content"]
