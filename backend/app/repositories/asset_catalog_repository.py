from sqlalchemy.orm import Session
from app.models.asset_registry import AssetRegistry


class AssetCatalogRepository:
    """Read the shared registry once; hierarchy assembly happens without lazy child queries."""

    def __init__(self, db: Session):
        self.db = db

    def list_assets(self):
        return self.db.query(AssetRegistry).order_by(
            AssetRegistry.module_code, AssetRegistry.asset_type, AssetRegistry.asset_code
        ).all()
