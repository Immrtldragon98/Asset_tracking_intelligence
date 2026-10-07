import os

import requests


SYSTEM_PROMPT = """You are the Asset Tracking Intelligence maintenance assistant for an industrial plant.
Help maintenance planners investigate assets, failures, PM history, component life, reliability and operating observations.
Be practical and evidence-driven. Never invent plant data. If supplied context is insufficient, clearly say what data is missing.
When giving a diagnosis, separate observed facts, likely causes, confidence, and recommended checks.
Do not issue commands that directly mutate the database.
"""


def ask_groq(question: str, context: str | None = None) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    user_message = question.strip()
    if context:
        user_message = f"Plant context:\n{context.strip()}\n\nQuestion:\n{user_message}"

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.2,
            "max_tokens": 1200,
        },
        timeout=45,
    )
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("Groq returned no response choices")
    return (choices[0].get("message", {}).get("content") or "No answer returned by Groq.").strip()
