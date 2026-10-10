from sqlalchemy import Column, DateTime, Integer, String, Text, func
from app.database.session import Base


class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(180), nullable=False)
    module_code = Column(String(12), nullable=False, default="ALL", index=True)
    schedule_type = Column(String(24), nullable=False, default="PM_OFFLINE", index=True)
    line_name = Column(String(32), nullable=True, index=True)
    equipment = Column(String(180), nullable=True)
    start_at = Column(DateTime(timezone=True), nullable=False, index=True)
    end_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default="PLANNED", index=True)
    assigned_to = Column(String(100), nullable=True)
    impact = Column(Text, nullable=True)
    work_scope = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
