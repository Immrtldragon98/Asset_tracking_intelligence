from sqlalchemy import Column, Date, DateTime, Float, Integer, String, Text, func
from app.database.session import Base


class DriveInventory(Base):
    """Dedicated DIR row preserving the source workbook's VFD and motor fields."""

    __tablename__ = "drive_inventory"

    id = Column(Integer, primary_key=True, index=True)
    source_row = Column(Integer, nullable=False, unique=True, index=True)
    area = Column(String(120), nullable=True)
    location = Column(String(160), nullable=True)
    equipment_name = Column(String(200), nullable=False)
    supply_from = Column(String(160), nullable=True)
    panel_location = Column(String(160), nullable=True)
    vfd_make = Column(String(120), nullable=True)
    vfd_rating = Column(String(80), nullable=True)
    module_quantity = Column(String(40), nullable=True)
    model_no = Column(String(160), nullable=True)
    spare_available = Column(String(120), nullable=True)
    spare_location = Column(String(200), nullable=True)
    ip_address = Column(String(80), nullable=True)
    module_power_supply = Column(String(120), nullable=True)
    motor_kw = Column(Float, nullable=True)
    voltage = Column(String(40), nullable=True)
    motor_rpm = Column(Float, nullable=True)
    motor_flc_amp = Column(Float, nullable=True)
    installation_date = Column(Date, nullable=True)
    running_hours = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
