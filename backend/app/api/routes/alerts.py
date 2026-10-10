from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.maintenance_alert import MaintenanceAlert

router = APIRouter()


class AlertCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: Optional[str] = None
    asset_code: Optional[str] = None
    module_code: Optional[str] = None
    severity: str = "MEDIUM"
    due_date: Optional[date] = None


class AlertUpdate(BaseModel):
    status: Optional[str] = None


def serialize(row):
    return {"id": row.id, "title": row.title, "description": row.description, "asset_code": row.asset_code,
            "module_code": row.module_code, "severity": row.severity, "due_date": row.due_date.isoformat() if row.due_date else None,
            "status": row.status, "created_at": row.created_at.isoformat() if row.created_at else None}


@router.get("")
def list_alerts(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MaintenanceAlert)
    if status:
        query = query.filter(MaintenanceAlert.status == status.upper())
    rows = query.order_by(MaintenanceAlert.created_at.desc()).all()
    return {"total": len(rows), "alerts": [serialize(row) for row in rows]}


@router.post("")
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    severity = payload.severity.upper()
    if severity not in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}:
        raise HTTPException(status_code=400, detail="Severity must be LOW, MEDIUM, HIGH, or CRITICAL.")
    row = MaintenanceAlert(**payload.model_dump(exclude={"severity"}), severity=severity, status="OPEN")
    db.add(row)
    db.commit()
    db.refresh(row)
    return serialize(row)


@router.patch("/{alert_id}")
def update_alert(alert_id: int, payload: AlertUpdate, db: Session = Depends(get_db)):
    row = db.query(MaintenanceAlert).filter(MaintenanceAlert.id == alert_id).one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Alert not found.")
    if payload.status:
        status = payload.status.upper()
        if status not in {"OPEN", "ACKNOWLEDGED", "RESOLVED"}:
            raise HTTPException(status_code=400, detail="Status must be OPEN, ACKNOWLEDGED, or RESOLVED.")
        row.status = status
    db.commit()
    db.refresh(row)
    return serialize(row)
