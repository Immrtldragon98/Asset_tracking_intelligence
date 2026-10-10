from datetime import datetime
from sqlalchemy import Column, Date, DateTime, Float, Integer, String, Text, func
from app.database.session import Base


class ComponentLifecycle(Base):
    """One physical component installation; never overwrite a replaced component's history."""
    __tablename__ = "component_lifecycles"

    id = Column(Integer, primary_key=True, index=True)
    module_code = Column(String(12), nullable=False, index=True)
    line_name = Column(String(32), nullable=True, index=True)
    position_number = Column(Integer, nullable=True, index=True)
    stand_code = Column(String(60), nullable=True, index=True)
    asset_code = Column(String(100), nullable=True, index=True)
    component_type = Column(String(80), nullable=False, index=True)
    component_side = Column(String(40), nullable=True)
    serial_number = Column(String(100), nullable=True, index=True)
    installed_on = Column(Date, nullable=False, index=True)
    removed_on = Column(Date, nullable=True, index=True)
    operating_hours_at_install = Column(Float, nullable=True)
    operating_hours_at_removal = Column(Float, nullable=True)
    removal_reason = Column(String(180), nullable=True)
    condition_on_removal = Column(Text, nullable=True)
    work_done = Column(Text, nullable=True)
    source_text = Column(Text, nullable=True)
    recorded_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ReliabilityEvent(Base):
    """Shared cross-register failure, inspection, repair and stand/component change history."""
    __tablename__ = "reliability_events"

    id = Column(Integer, primary_key=True, index=True)
    module_code = Column(String(12), nullable=False, index=True)
    event_at = Column(DateTime(timezone=True), nullable=False, index=True)
    line_name = Column(String(32), nullable=True, index=True)
    position_number = Column(Integer, nullable=True, index=True)
    stand_code = Column(String(60), nullable=True, index=True)
    asset_code = Column(String(100), nullable=True, index=True)
    equipment = Column(String(160), nullable=True, index=True)
    component_type = Column(String(80), nullable=True, index=True)
    event_type = Column(String(40), nullable=False, default="MAINTENANCE", index=True)
    failure_mode = Column(String(180), nullable=True, index=True)
    symptoms = Column(Text, nullable=True)
    suspected_cause = Column(Text, nullable=True)
    confirmed_cause = Column(Text, nullable=True)
    action_taken = Column(Text, nullable=True)
    part_removed = Column(String(120), nullable=True)
    part_installed = Column(String(120), nullable=True)
    downtime_minutes = Column(Float, nullable=True)
    operating_hours = Column(Float, nullable=True)
    source_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    verification_status = Column(String(20), nullable=False, default="VERIFIED", index=True)
    recorded_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
