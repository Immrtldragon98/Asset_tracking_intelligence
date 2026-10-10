from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text, func
from app.database.session import Base


class MaintenanceAlert(Base):
    __tablename__ = "maintenance_alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(180), nullable=False)
    description = Column(Text, nullable=True)
    asset_code = Column(String(100), nullable=True, index=True)
    module_code = Column(String(20), nullable=True, index=True)
    severity = Column(String(20), nullable=False, default="MEDIUM")
    due_date = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="OPEN", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
