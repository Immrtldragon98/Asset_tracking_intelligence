from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.asset_registry import AssetRegistry

router = APIRouter()


MODULES = [
    {"code": "DSIR", "name": "Digital Stand Intelligent Register", "short_name": "DSIR", "area": "Finishing Mill", "description": "Stand lifecycle, condition, campaign life, components and reliability."},
    {"code": "RMIR", "name": "Roughing Mill Intelligent Register", "short_name": "RMIR", "area": "Roughing Mill", "description": "Roughing mill stands and connected gearboxes, shafts, couplers, motors and drives."},
    {"code": "MIR", "name": "Motor Intelligent Register", "short_name": "MIR", "area": "Plant-wide", "description": "Motor identity, operating history, maintenance and failure intelligence."},
    {"code": "DIR", "name": "Drive Intelligent Register", "short_name": "DIR", "area": "Plant-wide", "description": "Drive identity, health, trips, maintenance and failure intelligence."},
    {"code": "SSIR", "name": "Screw Shaft Intelligent Register", "short_name": "SSIR", "area": "Plant-wide", "description": "Screw shaft lifecycle, maintenance, life and failure history."},
]


@router.get("/modules")
def get_modules():
    return MODULES


@router.get("/overview")
def get_asset_overview(db: Session = Depends(get_db)):
    total = db.query(AssetRegistry).count()
    active = db.query(AssetRegistry).filter(AssetRegistry.status == "ACTIVE").count()
    critical = db.query(AssetRegistry).filter(AssetRegistry.criticality == "HIGH").count()
    by_module = {}
    for module in MODULES:
        count = db.query(AssetRegistry).filter(AssetRegistry.module_code == module["code"]).count()
        by_module[module["code"]] = count

    return {
        "platform": "Asset Tracking Intelligence",
        "total_assets": total,
        "active_assets": active,
        "high_criticality_assets": critical,
        "module_counts": by_module,
        "relationship_model": "parent-child",
    }


RUNNING_CONFIG = {
    "DSIR": {
        "module": "DSIR",
        "area": "Finishing Mill",
        "lines": {
            "WRM1": ["1B", "2B", "3B", "4A", "5C", "6.1", "7B", "8B", "9D", "10C"],
            "WRM2": ["1.1", "2.1", "3E", "4.1", "5B", "6A", "7A", "8E", "9", "10.1"],
            "WRM3": ["1B", "2B", "3B", "4A", "5C", "6.1", "7B", "8B", "9D", "10C"],
        },
    },
    "RMIR": {
        "module": "RMIR",
        "area": "Roughing Mill",
        "lines": {
            "WRM1": ["1A", "2A", "3A", "4A", "5A"],
            "WRM2": ["1B", "2B", "3B", "4B", "5B"],
            "WRM3": ["1C", "2C", "3C", "4C", "5C"],
        },
    },
}


@router.get("/running-config/{module_code}")
def get_running_config(module_code: str):
    code = module_code.upper()
    config = RUNNING_CONFIG.get(code)
    if not config:
        return {"module": code, "area": None, "lines": {}, "total_running": 0}
    return {
        **config,
        "total_running": sum(len(values) for values in config["lines"].values()),
        "updated_at": "2026-10-08",
    }


@router.get("/{module_code}")
def get_module_assets(module_code: str, db: Session = Depends(get_db)):
    code = module_code.upper()
    if code not in {m["code"] for m in MODULES}:
        return {"module": code, "assets": [], "message": "Module is defined but has no registered assets yet."}

    assets = (
        db.query(AssetRegistry)
        .filter(AssetRegistry.module_code == code)
        .order_by(AssetRegistry.asset_type, AssetRegistry.position, AssetRegistry.id)
        .all()
    )
    return {
        "module": next(m for m in MODULES if m["code"] == code),
        "assets": [
            {
                "id": a.id,
                "asset_code": a.asset_code,
                "name": a.name,
                "asset_type": a.asset_type,
                "position": a.position,
                "status": a.status,
                "installation_date": a.installation_date,
                "criticality": a.criticality,
                "parent_id": a.parent_id,
                "operating_hours": a.operating_hours,
                "lifetime_hours": a.lifetime_hours,
                "is_running": str(a.status).upper() in {"ACTIVE","RUNNING","INSTALLED","IN_SERVICE","OPERATIONAL","COMMISSIONED"},
            }
            for a in assets
        ],
    }
