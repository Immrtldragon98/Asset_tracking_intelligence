from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


class AssetRegistry(Base):
    """Common asset identity/relationship layer shared by DSIR and future asset registers."""

    __tablename__ = "asset_registry"

    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String(80), unique=True, index=True, nullable=False)
    name = Column(String(160), nullable=False)
    asset_type = Column(String(60), nullable=False, index=True)
    module_code = Column(String(20), nullable=False, index=True)
    equipment = Column(String(100), nullable=True)
    area = Column(String(100), nullable=True)
    position = Column(String(60), nullable=True)
    manufacturer = Column(String(120), nullable=True)
    model = Column(String(120), nullable=True)
    installation_date = Column(Date, nullable=True)
    status = Column(String(40), nullable=False, default="ACTIVE")
    location = Column(String(120), nullable=True)
    operating_hours = Column(Float, nullable=False, default=0.0)
    lifetime_hours = Column(Float, nullable=False, default=0.0)
    criticality = Column(String(20), nullable=False, default="MEDIUM")
    notes = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("asset_registry.id"), nullable=True)

    parent = relationship("AssetRegistry", remote_side=[id], back_populates="children")
    children = relationship("AssetRegistry", back_populates="parent")
