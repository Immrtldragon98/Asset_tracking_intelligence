"""Expand RMIR hierarchy with entry guides and side-specific couplers.

Revision ID: 20261008_rmir_hierarchy
Revises: 20261007_asset_intelligence_core
"""

from alembic import op
import sqlalchemy as sa


revision = "20261008_rmir_hierarchy"
down_revision = "20261007_asset_intelligence_core"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # Preserve the original generic coupler rows while making their role explicit.
    conn.execute(sa.text("""
        UPDATE asset_registry
        SET asset_code = 'RM-CP-GB' || :position,
            name = 'RM Coupler ' || :position || ' (GB Side)'
        WHERE asset_code = 'RM-CP' || :position
    """), [{"position": str(i)} for i in range(1, 6)])

    for i in range(1, 6):
        stand_id = conn.execute(
            sa.text("SELECT id FROM asset_registry WHERE asset_code=:code"),
            {"code": f"RM-ST{i}"},
        ).scalar_one()

        # Entry guide belongs directly to the RM stand.
        exists = conn.execute(
            sa.text("SELECT 1 FROM asset_registry WHERE asset_code=:code"),
            {"code": f"RM-EG{i}"},
        ).first()
        if not exists:
            conn.execute(sa.text("""
                INSERT INTO asset_registry
                (asset_code,name,asset_type,module_code,equipment,area,position,status,
                 operating_hours,lifetime_hours,criticality,parent_id)
                VALUES (:code,:name,'ENTRY_GUIDE','RMIR','Roughing Mill','Roughing Mill',
                        :position,'ACTIVE',0,0,'MEDIUM',:parent_id)
            """), {
                "code": f"RM-EG{i}",
                "name": f"RM Entry Guide {i}",
                "position": str(i),
                "parent_id": stand_id,
            })

        # Motor-side coupler is a distinct physical/maintenance identity.
        exists = conn.execute(
            sa.text("SELECT 1 FROM asset_registry WHERE asset_code=:code"),
            {"code": f"RM-CP-M{i}"},
        ).first()
        if not exists:
            conn.execute(sa.text("""
                INSERT INTO asset_registry
                (asset_code,name,asset_type,module_code,equipment,area,position,status,
                 operating_hours,lifetime_hours,criticality,parent_id)
                VALUES (:code,:name,'COUPLER','RMIR','Roughing Mill','Roughing Mill',
                        :position,'ACTIVE',0,0,'MEDIUM',:parent_id)
            """), {
                "code": f"RM-CP-M{i}",
                "name": f"RM Coupler {i} (Motor Side)",
                "position": str(i),
                "parent_id": stand_id,
            })


def downgrade():
    conn = op.get_bind()

    for i in range(1, 6):
        conn.execute(
            sa.text("DELETE FROM asset_registry WHERE asset_code=:code"),
            {"code": f"RM-CP-M{i}"},
        )
        conn.execute(
            sa.text("DELETE FROM asset_registry WHERE asset_code=:code"),
            {"code": f"RM-EG{i}"},
        )
        conn.execute(sa.text("""
            UPDATE asset_registry
            SET asset_code = :old_code,
                name = :old_name
            WHERE asset_code = :new_code
        """), {
            "old_code": f"RM-CP{i}",
            "old_name": f"Coupler {i}",
            "new_code": f"RM-CP-GB{i}",
        })
