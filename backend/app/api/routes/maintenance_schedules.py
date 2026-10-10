from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.maintenance_schedule import MaintenanceSchedule

router = APIRouter()
MODULES = {"ALL", "DSIR", "RMIR", "MIR", "DIR", "SSIR"}
TYPES = {"PM_OFFLINE", "BELT_CHANGE", "SHUTDOWN", "INSPECTION", "OVERHAUL", "OTHER"}
STATUSES = {"PLANNED", "APPROVED", "IN_PROGRESS", "COMPLETED", "DEFERRED", "CANCELLED"}


class ScheduleInput(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    module_code: str = "ALL"
    schedule_type: str = "PM_OFFLINE"
    line_name: Optional[str] = None
    equipment: Optional[str] = None
    start_at: datetime
    end_at: Optional[datetime] = None
    status: str = "PLANNED"
    assigned_to: Optional[str] = None
    impact: Optional[str] = None
    work_scope: Optional[str] = None
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_schedule(self):
        self.module_code = self.module_code.strip().upper()
        self.schedule_type = self.schedule_type.strip().upper()
        self.status = self.status.strip().upper()
        if self.module_code not in MODULES:
            raise ValueError("module_code must be ALL, DSIR, RMIR, MIR, DIR, or SSIR")
        if self.schedule_type not in TYPES:
            raise ValueError("Invalid maintenance schedule type")
        if self.status not in STATUSES:
            raise ValueError("Invalid maintenance schedule status")
        if self.end_at and self.end_at < self.start_at:
            raise ValueError("End time must be after start time")
        return self


def serialize(row):
    return {
        "id": row.id, "title": row.title, "module_code": row.module_code,
        "schedule_type": row.schedule_type, "line_name": row.line_name,
        "equipment": row.equipment, "start_at": row.start_at.isoformat() if row.start_at else None,
        "end_at": row.end_at.isoformat() if row.end_at else None, "status": row.status,
        "assigned_to": row.assigned_to, "impact": row.impact, "work_scope": row.work_scope,
        "remarks": row.remarks, "created_by": row.created_by,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


@router.get("")
def list_schedules(module: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(MaintenanceSchedule)
    if module and module.upper() != "ALL":
        q = q.filter(MaintenanceSchedule.module_code.in_([module.upper(), "ALL"]))
    if status:
        q = q.filter(MaintenanceSchedule.status == status.upper())
    rows = q.order_by(MaintenanceSchedule.start_at.desc(), MaintenanceSchedule.id.desc()).limit(500).all()
    return {"total": len(rows), "schedules": [serialize(row) for row in rows]}


@router.post("")
def create_schedule(payload: ScheduleInput, db: Session = Depends(get_db)):
    row = MaintenanceSchedule(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return serialize(row)


@router.put("/{schedule_id}")
def update_schedule(schedule_id: int, payload: ScheduleInput, db: Session = Depends(get_db)):
    row = db.get(MaintenanceSchedule, schedule_id)
    if not row:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return serialize(row)


@router.patch("/{schedule_id}/status")
def update_status(schedule_id: int, status: str, db: Session = Depends(get_db)):
    row = db.get(MaintenanceSchedule, schedule_id)
    if not row:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    value = status.upper()
    if value not in STATUSES:
        raise HTTPException(status_code=400, detail="Invalid maintenance schedule status")
    row.status = value
    db.commit()
    db.refresh(row)
    return serialize(row)


@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    row = db.get(MaintenanceSchedule, schedule_id)
    if not row:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    db.delete(row)
    db.commit()
    return {"status": "deleted", "id": schedule_id}
