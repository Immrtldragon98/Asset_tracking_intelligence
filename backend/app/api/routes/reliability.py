import json
import re
from datetime import date, datetime, time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.reliability_intelligence import ComponentLifecycle, ReliabilityEvent
from app.models.stand_change_event import StandChangeEvent
from app.models.stand_position import Position
from app.models.line import Line
from app.models.stand_asset import StandAsset
from app.models.pm_activity import PMActivity
from app.services.groq_ai import ask_groq

router = APIRouter()
MODULES = {"ALL", "DSIR", "RMIR", "MIR", "DIR", "SSIR"}
EVENT_TYPES = {"MAINTENANCE", "BREAKDOWN", "INSPECTION", "REPAIR", "COMPONENT_CHANGE", "STAND_CHANGE", "PM", "OBSERVATION", "OTHER"}
COMPONENT_TYPES = {"STAND", "ROLL", "ENTRY_GUIDE", "GEARBOX", "GB", "MOTOR", "FLOATING_SHAFT", "COUPLER", "COUPLER_MOTOR_SIDE", "COUPLER_GB_SIDE", "BEARING", "OIL_SEAL", "SLEEVE", "SHAFT", "SCREW_SHAFT", "DRIVE", "VFD", "OTHER"}


class ComponentInput(BaseModel):
    module_code: str = "RMIR"
    line_name: Optional[str] = None
    position_number: Optional[int] = Field(default=None, ge=1, le=20)
    stand_code: Optional[str] = None
    asset_code: Optional[str] = None
    component_type: str
    component_side: Optional[str] = None
    serial_number: Optional[str] = None
    installed_on: date
    removed_on: Optional[date] = None
    operating_hours_at_install: Optional[float] = Field(default=None, ge=0)
    operating_hours_at_removal: Optional[float] = Field(default=None, ge=0)
    removal_reason: Optional[str] = None
    condition_on_removal: Optional[str] = None
    work_done: Optional[str] = None
    source_text: Optional[str] = None

    @model_validator(mode="after")
    def validate_values(self):
        self.module_code = self.module_code.strip().upper()
        self.component_type = self.component_type.strip().upper().replace(" ", "_")
        if self.module_code not in MODULES - {"ALL"}:
            raise ValueError("Select DSIR, RMIR, MIR, DIR or SSIR")
        if self.component_type not in COMPONENT_TYPES:
            raise ValueError("Unsupported component type")
        if self.removed_on and self.removed_on < self.installed_on:
            raise ValueError("Removed date cannot be before installed date")
        if self.operating_hours_at_install is not None and self.operating_hours_at_removal is not None and self.operating_hours_at_removal < self.operating_hours_at_install:
            raise ValueError("Removal operating hours cannot be less than installation hours")
        return self


class EventInput(BaseModel):
    module_code: str = "RMIR"
    event_at: datetime
    line_name: Optional[str] = None
    position_number: Optional[int] = Field(default=None, ge=1, le=20)
    stand_code: Optional[str] = None
    asset_code: Optional[str] = None
    equipment: Optional[str] = None
    component_type: Optional[str] = None
    event_type: str = "OTHER"
    failure_mode: Optional[str] = None
    symptoms: Optional[str] = None
    suspected_cause: Optional[str] = None
    confirmed_cause: Optional[str] = None
    action_taken: Optional[str] = None
    part_removed: Optional[str] = None
    part_installed: Optional[str] = None
    downtime_minutes: Optional[float] = Field(default=None, ge=0)
    operating_hours: Optional[float] = Field(default=None, ge=0)
    source_text: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_confidence: Optional[float] = Field(default=None, ge=0, le=1)
    verification_status: str = "VERIFIED"

    @model_validator(mode="after")
    def validate_values(self):
        self.module_code = self.module_code.strip().upper()
        self.event_type = self.event_type.strip().upper()
        self.verification_status = self.verification_status.strip().upper()
        if self.module_code not in MODULES - {"ALL"}:
            raise ValueError("Select a register")
        if self.event_type not in EVENT_TYPES:
            raise ValueError("Invalid event type")
        if self.verification_status not in {"VERIFIED", "AI_REVIEW"}:
            raise ValueError("Invalid verification status")
        return self


class AnalyseInput(BaseModel):
    text: str = Field(min_length=5, max_length=20000)
    module_code: str = "RMIR"


def component_out(x):
    days = ((x.removed_on or date.today()) - x.installed_on).days
    hours = None
    if x.operating_hours_at_install is not None and x.operating_hours_at_removal is not None:
        hours = round(x.operating_hours_at_removal - x.operating_hours_at_install, 1)
    return {
        "id": x.id, "module_code": x.module_code, "line_name": x.line_name,
        "position_number": x.position_number, "stand_code": x.stand_code, "asset_code": x.asset_code,
        "component_type": x.component_type, "component_side": x.component_side, "serial_number": x.serial_number,
        "installed_on": x.installed_on.isoformat(), "removed_on": x.removed_on.isoformat() if x.removed_on else None,
        "life_days": max(days, 0), "operating_hours_at_install": x.operating_hours_at_install,
        "operating_hours_at_removal": x.operating_hours_at_removal, "observed_life_hours": hours,
        "removal_reason": x.removal_reason, "condition_on_removal": x.condition_on_removal,
        "work_done": x.work_done, "source_text": x.source_text, "recorded_by": x.recorded_by,
    }


def event_out(x):
    return {k: getattr(x, k) for k in [
        "id","module_code","event_at","line_name","position_number","stand_code","asset_code","equipment",
        "component_type","event_type","failure_mode","symptoms","suspected_cause","confirmed_cause","action_taken",
        "part_removed","part_installed","downtime_minutes","operating_hours","source_text","ai_summary",
        "ai_confidence","verification_status","recorded_by","created_at"
    ]}


@router.get("/components")
def list_components(module: str = "ALL", line: Optional[str] = None, component_type: Optional[str] = None,
                    active_only: bool = False, db: Session = Depends(get_db)):
    q = db.query(ComponentLifecycle)
    if module.upper() != "ALL": q = q.filter(ComponentLifecycle.module_code == module.upper())
    if line: q = q.filter(ComponentLifecycle.line_name == line.upper())
    if component_type: q = q.filter(ComponentLifecycle.component_type == component_type.upper().replace(" ", "_"))
    if active_only: q = q.filter(ComponentLifecycle.removed_on.is_(None))
    rows = q.order_by(ComponentLifecycle.installed_on.desc(), ComponentLifecycle.id.desc()).limit(2000).all()
    return {"total": len(rows), "components": [component_out(x) for x in rows]}


@router.post("/components")
def create_component(payload: ComponentInput, db: Session = Depends(get_db)):
    row = ComponentLifecycle(**payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return component_out(row)


@router.get("/events")
def list_events(module: str = "ALL", line: Optional[str] = None, position: Optional[int] = None,
                component: Optional[str] = None, qtext: Optional[str] = None, limit: int = 500,
                db: Session = Depends(get_db)):
    q = db.query(ReliabilityEvent)
    if module.upper() != "ALL": q = q.filter(ReliabilityEvent.module_code == module.upper())
    if line: q = q.filter(ReliabilityEvent.line_name == line.upper())
    if position: q = q.filter(ReliabilityEvent.position_number == position)
    if component: q = q.filter(ReliabilityEvent.component_type == component.upper().replace(" ", "_"))
    if qtext:
        like = "%" + qtext.strip()[:120] + "%"
        q = q.filter((ReliabilityEvent.source_text.ilike(like)) | (ReliabilityEvent.symptoms.ilike(like)) |
                     (ReliabilityEvent.failure_mode.ilike(like)) | (ReliabilityEvent.action_taken.ilike(like)) |
                     (ReliabilityEvent.stand_code.ilike(like)) | (ReliabilityEvent.equipment.ilike(like)))
    rows = q.order_by(ReliabilityEvent.event_at.desc(), ReliabilityEvent.id.desc()).limit(max(1, min(limit, 1000))).all()
    results = [event_out(x) for x in rows]
    # Preserve legacy stand changes and PM message imports in the same history view.
    # These older tables predate module tagging, so they are attributed to DSIR only.
    if module.upper() in {"ALL", "DSIR"}:
        legacy_q = db.query(StandChangeEvent, Position, Line, StandAsset).join(
            Position, StandChangeEvent.position_id == Position.id
        ).join(Line, Position.line_id == Line.id).join(
            StandAsset, StandChangeEvent.installed_stand_id == StandAsset.id
        )
        if line: legacy_q = legacy_q.filter(Line.name == line.upper())
        if position: legacy_q = legacy_q.filter(Position.position_number == position)
        for ev, pos, ln, installed in legacy_q.order_by(StandChangeEvent.changed_at.desc()).limit(300).all():
            results.append({
                "id": -1000000 - ev.id, "module_code": "DSIR", "event_at": ev.changed_at.isoformat(),
                "line_name": ln.name, "position_number": pos.position_number, "stand_code": installed.code,
                "asset_code": None, "equipment": "Stand", "component_type": "STAND", "event_type": "STAND_CHANGE",
                "failure_mode": ev.removed_condition or ev.reason, "symptoms": ev.removed_condition,
                "suspected_cause": None, "confirmed_cause": None,
                "action_taken": f"Removed stand ID {ev.removed_stand_id}; installed {installed.code}",
                "part_removed": str(ev.removed_stand_id), "part_installed": installed.code,
                "downtime_minutes": None, "operating_hours": None, "source_text": ev.notes or ev.reason,
                "ai_summary": f"Stand changed by {ev.changed_by}. Reason: {ev.reason}",
                "ai_confidence": None, "verification_status": "LEGACY_HISTORY",
                "recorded_by": ev.changed_by, "created_at": ev.changed_at.isoformat()
            })
        pm_q = db.query(PMActivity)
        if line: pm_q = pm_q.filter(PMActivity.line_name == line.upper())
        if position: pm_q = pm_q.filter(PMActivity.position_number == position)
        for pm in pm_q.order_by(PMActivity.planned_date.desc(), PMActivity.id.desc()).limit(300).all():
            if component and (pm.component or "").upper().replace(" ", "_") != component.upper().replace(" ", "_"):
                continue
            results.append({
                "id": -2000000 - pm.id, "module_code": "DSIR", "event_at": datetime.combine(pm.planned_date, time.min).isoformat(),
                "line_name": pm.line_name, "position_number": pm.position_number, "stand_code": pm.stand_code,
                "asset_code": None, "equipment": pm.equipment, "component_type": pm.component,
                "event_type": pm.activity_type or "PM", "failure_mode": None, "symptoms": pm.remarks,
                "suspected_cause": None, "confirmed_cause": None, "action_taken": pm.activity,
                "part_removed": pm.from_value, "part_installed": pm.to_value, "downtime_minutes": None,
                "operating_hours": None, "source_text": pm.source_text, "ai_summary": None,
                "ai_confidence": None, "verification_status": "LEGACY_HISTORY", "recorded_by": pm.created_by,
                "created_at": pm.created_at.isoformat() if pm.created_at else None
            })
    if qtext:
        term = qtext.lower()
        results = [x for x in results if term in " ".join(str(x.get(k) or "") for k in
                   ("source_text","symptoms","failure_mode","action_taken","stand_code","equipment","component_type")).lower()]
    results.sort(key=lambda x: str(x.get("event_at") or ""), reverse=True)
    results = results[:max(1, min(limit, 1000))]
    return {"total": len(results), "events": results}


@router.post("/ask")
def ask_reliability(payload: AnalyseInput, db: Session = Depends(get_db)):
    module = payload.module_code.strip().upper()
    if module not in MODULES:
        raise HTTPException(400, "Invalid register")
    terms = [x for x in re.findall(r"[A-Za-z0-9_-]{3,}", payload.text.lower()) if x not in {"what","when","where","which","about","before","after","failure","breakdown"}][:8]
    q = db.query(ReliabilityEvent)
    if module != "ALL": q = q.filter(ReliabilityEvent.module_code == module)
    if terms:
        from sqlalchemy import or_
        clauses = []
        for term in terms:
            like = "%" + term + "%"
            clauses.extend([ReliabilityEvent.symptoms.ilike(like), ReliabilityEvent.failure_mode.ilike(like),
                            ReliabilityEvent.action_taken.ilike(like), ReliabilityEvent.equipment.ilike(like),
                            ReliabilityEvent.component_type.ilike(like), ReliabilityEvent.stand_code.ilike(like),
                            ReliabilityEvent.source_text.ilike(like)])
        matched = q.filter(or_(*clauses)).order_by(ReliabilityEvent.event_at.desc()).limit(30).all()
    else:
        matched = q.order_by(ReliabilityEvent.event_at.desc()).limit(30).all()
    context_rows = []
    for row in matched:
        context_rows.append({
            "date": row.event_at.isoformat(), "register": row.module_code, "line": row.line_name,
            "position": row.position_number, "stand": row.stand_code, "equipment": row.equipment,
            "component": row.component_type, "event": row.event_type, "failure": row.failure_mode,
            "symptoms": row.symptoms, "suspected_cause": row.suspected_cause,
            "confirmed_cause": row.confirmed_cause, "action": row.action_taken,
            "removed": row.part_removed, "installed": row.part_installed, "source": row.source_text
        })
    if module in {"ALL", "DSIR"}:
        legacy = db.query(StandChangeEvent, Position, Line, StandAsset).join(
            Position, StandChangeEvent.position_id == Position.id
        ).join(Line, Position.line_id == Line.id).join(
            StandAsset, StandChangeEvent.installed_stand_id == StandAsset.id
        ).order_by(StandChangeEvent.changed_at.desc()).limit(30).all()
        for event, position, line, stand in legacy:
            context_rows.append({"date": event.changed_at.isoformat(), "register": "DSIR",
                "line": line.name, "position": position.position_number, "stand": stand.code,
                "event": "STAND_CHANGE", "failure": event.removed_condition or event.reason,
                "action": f"Removed stand ID {event.removed_stand_id}; installed {stand.code}",
                "reason": event.reason, "notes": event.notes})
    if module in {"ALL", "DSIR"}:
        pm_rows = db.query(PMActivity).order_by(PMActivity.planned_date.desc()).limit(30).all()
        for row in pm_rows:
            context_rows.append({"date": row.planned_date.isoformat(), "register": "DSIR",
                "line": row.line_name, "position": row.position_number, "stand": row.stand_code,
                "equipment": row.equipment, "component": row.component, "event": row.activity_type,
                "symptoms": row.remarks, "action": row.activity, "removed": row.from_value,
                "installed": row.to_value, "source": row.source_text})
    context_rows = context_rows[:60]
    if not context_rows:
        return {"answer":"No verified historical records match this query yet. Add maintenance messages or component histories first; I will not invent a past failure.",
                "matched_records":0,"sources":[]}
    try:
        answer = ask_groq(
            "Investigate this maintenance question using only the supplied records. State matching past events and dates first, then verified actions, confirmed vs suspected causes, recurrence signals, and practical checks. If records do not prove a cause, say so. Cite event date, line/position and component for each claim. Do not invent details.\n\nQuestion: " + payload.text,
            context=json.dumps(context_rows, default=str)
        )
    except Exception:
        answer = "The AI provider is unavailable. Matching stored history is shown below so you can still inspect the evidence."
    return {"answer":answer,"matched_records":len(context_rows),"sources":context_rows[:15]}


@router.post("/events")
def create_event(payload: EventInput, db: Session = Depends(get_db)):
    row = ReliabilityEvent(**payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return event_out(row)


@router.post("/analyse")
def analyse_message(payload: AnalyseInput):
    module = payload.module_code.strip().upper()
    if module not in MODULES - {"ALL"}: raise HTTPException(400, "Invalid register")
    prompt = f"""Extract industrial maintenance facts from the source message as strict JSON with one object: {{\"events\":[...],\"components\":[...]}}.
Never invent facts. Preserve dates only when explicitly written; date format DD/MM/YYYY should be converted to YYYY-MM-DD. If date is absent use null. One event per distinct failure, inspection, repair, or component change. Each event keys: event_at (ISO datetime or date or null), line_name, position_number, stand_code, asset_code, equipment, component_type, event_type (BREAKDOWN/INSPECTION/REPAIR/COMPONENT_CHANGE/STAND_CHANGE/PM/OBSERVATION/OTHER), failure_mode, symptoms, suspected_cause, confirmed_cause, action_taken, part_removed, part_installed, downtime_minutes, operating_hours, ai_summary, ai_confidence (0-1), verification_status (AI_REVIEW). Component types may include STAND, ROLL, ENTRY_GUIDE, GEARBOX, MOTOR, FLOATING_SHAFT, COUPLER_MOTOR_SIDE, COUPLER_GB_SIDE, BEARING, OIL_SEAL, SLEEVE, SHAFT, SCREW_SHAFT, DRIVE, VFD, OTHER. Each component keys: line_name, position_number, stand_code, asset_code, component_type, component_side, serial_number, installed_on, removed_on, operating_hours_at_install, operating_hours_at_removal, removal_reason, condition_on_removal, work_done. Only include a component record when an install/replacement date is explicitly known. Do not treat suspected causes as confirmed. Do not fabricate missing dates, equipment IDs, hours, or people. module_code is {module}.
SOURCE MESSAGE:
{payload.text}
"""
    try:
        raw = ask_groq(prompt)
        match = re.search(r"\{.*\}", raw, re.S)
        data = json.loads(match.group(0) if match else raw)
        events = data.get("events", [])
        components = data.get("components", [])
        provider = "Groq"
    except Exception:
        # Safe fallback: retain the source as an unclassified review item instead of losing the report.
        events = [{
            "event_at": None, "line_name": None, "position_number": None, "stand_code": None, "asset_code": None,
            "equipment": None, "component_type": None, "event_type": "OTHER", "failure_mode": None,
            "symptoms": payload.text[:2000], "suspected_cause": None, "confirmed_cause": None,
            "action_taken": None, "part_removed": None, "part_installed": None, "downtime_minutes": None,
            "operating_hours": None, "ai_summary": "AI extraction unavailable. Review and classify this source message manually.",
            "ai_confidence": 0.0, "verification_status": "AI_REVIEW"
        }]
        components = []
        provider = "manual-review-fallback"
    clean_events = []
    for e in events:
        e["module_code"] = module
        e["verification_status"] = "AI_REVIEW"
        if not e.get("event_at"): e["event_at"] = None
        clean_events.append(e)
    for c in components: c["module_code"] = module
    return {"provider": provider, "events": clean_events, "components": components,
            "source_text": payload.text, "notice": "Review every extracted field. Nothing is saved until confirmation."}


class ConfirmInput(BaseModel):
    events: list[dict] = []
    components: list[dict] = []
    source_text: Optional[str] = None


@router.post("/confirm")
def confirm_analysis(payload: ConfirmInput, db: Session = Depends(get_db)):
    saved_events, saved_components, skipped = [], [], []
    for idx, raw in enumerate(payload.events):
        try:
            raw = {**raw, "source_text": payload.source_text or raw.get("source_text"), "verification_status": "VERIFIED"}
            if not raw.get("event_at"): raise ValueError("Event date is missing; add a date before saving verified history.")
            parsed = EventInput(**raw)
            row = ReliabilityEvent(**parsed.model_dump())
            db.add(row); db.flush()
            saved_events.append(row.id)
        except Exception as exc:
            skipped.append({"kind":"event","index":idx,"reason":str(exc)})
    for idx, raw in enumerate(payload.components):
        try:
            raw = {**raw, "source_text": payload.source_text or raw.get("source_text")}
            if not raw.get("installed_on"): raise ValueError("Installation date is missing; component life cannot be calculated without it.")
            parsed = ComponentInput(**raw)
            row = ComponentLifecycle(**parsed.model_dump())
            db.add(row); db.flush()
            saved_components.append(row.id)
        except Exception as exc:
            skipped.append({"kind":"component","index":idx,"reason":str(exc)})
    db.commit()
    return {"saved_events": saved_events, "saved_components": saved_components, "skipped": skipped,
            "message": "Verified records saved. AI source text retained for audit."}
