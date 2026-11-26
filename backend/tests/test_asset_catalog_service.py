from types import SimpleNamespace
from app.services.asset_catalog_service import AssetCatalogService


def test_catalog_preserves_identity_and_missing_location():
    values = {
        "id": 7, "asset_code": "WRM2-MOTOR", "name": "Motor", "asset_type": "MOTOR",
        "module_code": "RMIR", "parent_id": None, "equipment": "Roughing Mill",
        "area": "Roughing Mill", "position": "1", "location": None,
        "manufacturer": None, "model": None, "installation_date": None,
        "status": "ACTIVE", "criticality": "HIGH", "notes": None,
    }

    class Repository:
        calls = 0

        def list_assets(self):
            self.calls += 1
            return [SimpleNamespace(**values)]

    repository = Repository()
    result = AssetCatalogService(repository).get_catalog()
    assert repository.calls == 1
    assert result["assets"] == [values]
    assert result["source"] == "asset_registry"
    assert result["assets"][0]["location"] is None
    assert "is_running" not in result["assets"][0]


def test_empty_catalog_stays_empty():
    class Repository:
        def list_assets(self):
            return []

    assert AssetCatalogService(Repository()).get_catalog()["assets"] == []
