from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.asset_registry import AssetRegistry
from app.services.groq_ai import ask_groq

router = APIRouter()


class AssistantRequest(BaseModel):
    question: str = Field(min_length=1, max_length=12000)
    context: str | None = Field(default=None, max_length=30000)
    asset_code: str | None = Field(default=None, max_length=80)


class AssistantResponse(BaseModel):
    answer: str
    model: str
    asset_code: str | None = None


def _asset_context(asset: AssetRegistry, db: Session) -> str:
    rows = db.query(AssetRegistry).all()
    by_parent: dict[int | None, list[AssetRegistry]] = {}
    for row in rows:
        by_parent.setdefault(row.parent_id, []).append(row)

    def walk(node: AssetRegistry, depth: int = 0) -> list[str]:
        prefix = "  " * depth
        lines = [
            f"{prefix}- {node.asset_code}: {node.name} "
            f"(type={node.asset_type}, module={node.module_code}, "
            f"status={node.status}, criticality={node.criticality}, position={node.position or 'n/a'})"
        ]
        for child in sorted(by_parent.get(node.id, []), key=lambda x: (x.asset_type, x.asset_code)):
            lines.extend(walk(child, depth + 1))
        return lines

    lines = walk(asset)
    if asset.parent_id:
        parent = db.query(AssetRegistry).filter(AssetRegistry.id == asset.parent_id).first()
        if parent:
            lines.insert(0, f"Parent asset: {parent.asset_code} — {parent.name}")
    return "\n".join(lines)


@router.post("/chat", response_model=AssistantResponse)
def chat(request: AssistantRequest, db: Session = Depends(get_db)):
    model = __import__("os").getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    context = request.context

    if request.asset_code:
        asset = (
            db.query(AssetRegistry)
            .filter(AssetRegistry.asset_code == request.asset_code.upper())
            .first()
        )
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {request.asset_code} was not found.")
        relationship_context = _asset_context(asset, db)
        context = (
            f"{context}\n\n" if context else ""
        ) + "Asset relationship context:\n" + relationship_context

    return {
        "answer": ask_groq(request.question, context),
        "model": model,
        "asset_code": request.asset_code.upper() if request.asset_code else None,
    }
