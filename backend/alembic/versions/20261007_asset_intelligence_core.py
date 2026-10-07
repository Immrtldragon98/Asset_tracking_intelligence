"""Add common Asset Tracking Intelligence registry and RMIR baseline.

Revision ID: 20261007_asset_intelligence_core
Revises: 20260913_pm_activity_log
"""

from alembic import op
import sqlalchemy as sa


revision = "20261007_asset_intelligence_core"
down_revision = "20260913_pm_activity_log"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "asset_registry",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("asset_code", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("asset_type", sa.String(length=60), nullable=False),
        sa.Column("module_code", sa.String(length=20), nullable=False),
        sa.Column("equipment", sa.String(length=100), nullable=True),
        sa.Column("area", sa.String(length=100), nullable=True),
        sa.Column("position", sa.String(length=60), nullable=True),
        sa.Column("manufacturer", sa.String(length=120), nullable=True),
        sa.Column("model", sa.String(length=120), nullable=True),
        sa.Column("installation_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="ACTIVE"),
        sa.Column("location", sa.String(length=120), nullable=True),
        sa.Column("operating_hours", sa.Float(), nullable=False, server_default="0"),
        sa.Column("lifetime_hours", sa.Float(), nullable=False, server_default="0"),
        sa.Column("criticality", sa.String(length=20), nullable=False, server_default="MEDIUM"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("asset_registry.id"), nullable=True),
        sa.UniqueConstraint("asset_code"),
    )
    op.create_index("ix_asset_registry_asset_code", "asset_registry", ["asset_code"])
    op.create_index("ix_asset_registry_asset_type", "asset_registry", ["asset_type"])
    op.create_index("ix_asset_registry_module_code", "asset_registry", ["module_code"])

    # Initial RMIR structure: five roughing-mill stands with their directly
    # associated equipment. This is intentionally a baseline, not invented
    # manufacturer/model data.
    conn = op.get_bind()
    assets = []
    for i in range(1, 6):
        assets.append({
            "asset_code": f"RM-ST{i}",
            "name": f"Roughing Mill Stand {i}",
            "asset_type": "STAND",
            "module_code": "RMIR",
            "equipment": "Roughing Mill",
            "area": "Roughing Mill",
            "position": str(i),
            "status": "ACTIVE",
            "criticality": "HIGH",
        })
    conn.execute(sa.text("""
        INSERT INTO asset_registry
        (asset_code,name,asset_type,module_code,equipment,area,position,status,operating_hours,lifetime_hours,criticality)
        VALUES (:asset_code,:name,:asset_type,:module_code,:equipment,:area,:position,:status,0,0,:criticality)
    """), assets)

    types = [
        ("GB", "GEARBOX", "Gearbox"),
        ("FS", "FLOATING_SHAFT", "Floating Shaft"),
        ("CP", "COUPLER", "Coupler"),
        ("M", "MOTOR", "Motor"),
        ("DR", "DRIVE", "Drive"),
        ("SS", "SCREW_SHAFT", "Screw Shaft"),
    ]
    for i in range(1, 6):
        stand_id = conn.execute(
            sa.text("SELECT id FROM asset_registry WHERE asset_code=:code"),
            {"code": f"RM-ST{i}"},
        ).scalar_one()
        for prefix, asset_type, label in types:
            conn.execute(sa.text("""
                INSERT INTO asset_registry
                (asset_code,name,asset_type,module_code,equipment,area,position,status,operating_hours,lifetime_hours,criticality,parent_id)
                VALUES (:code,:name,:type,'RMIR','Roughing Mill','Roughing Mill',:position,'ACTIVE',0,0,:criticality,:parent_id)
            """), {
                "code": f"RM-{prefix}{i}",
                "name": f"{label} {i}",
                "type": asset_type,
                "position": str(i),
                "criticality": "HIGH" if asset_type in {"GEARBOX", "MOTOR", "DRIVE"} else "MEDIUM",
                "parent_id": stand_id,
            })


def downgrade():
    op.drop_index("ix_asset_registry_module_code", table_name="asset_registry")
    op.drop_index("ix_asset_registry_asset_type", table_name="asset_registry")
    op.drop_index("ix_asset_registry_asset_code", table_name="asset_registry")
    op.drop_table("asset_registry")
