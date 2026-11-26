from app.repositories.asset_catalog_repository import AssetCatalogRepository


class AssetCatalogService:
    """Expose recorded identity and location without deriving operating state."""

    def __init__(self, repository: AssetCatalogRepository):
        self.repository = repository

    def get_catalog(self):
        fields = (
            "id", "asset_code", "name", "asset_type", "module_code", "parent_id",
            "equipment", "area", "position", "location", "manufacturer", "model",
            "installation_date", "status", "criticality", "notes",
        )
        return {
            "assets": [{field: getattr(asset, field) for field in fields}
                       for asset in self.repository.list_assets()],
            "source": "asset_registry",
            "location_rule": "Explicit recorded location or parent location; no inferred line assignment.",
        }
