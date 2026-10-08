"""Reset stand preparation data and normalize the preparation workflow.

Revision ID: 20261008_reset_stand_preparation
Revises: 20261008_rmir_hierarchy
"""

from alembic import op
import sqlalchemy as sa


revision = "20261008_reset_stand_preparation"
down_revision = "20261008_rmir_hierarchy"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # Remove the erroneous preparation checklist/history data so the register
    # starts from a clean operational baseline.
    conn.execute(sa.text("DELETE FROM stand_preparation_events"))
    conn.execute(sa.text("DELETE FROM stand_component_preparation_items"))
    conn.execute(sa.text("DELETE FROM stand_component_preparations"))

    # Preserve genuinely READY and RUNNING/INSTALLED assets. Everything else
    # returns to the single Pending queue.
    conn.execute(sa.text("""
        UPDATE stand_assets
        SET current_status = CASE
                WHEN current_status::text = 'READY' THEN 'READY'::statusenum
                WHEN current_status::text = 'INSTALLED' THEN 'INSTALLED'::statusenum
                ELSE 'PENDING'::statusenum
            END,
            current_location = CASE
                WHEN current_status::text = 'READY' THEN 'READY_AREA'::locationenum
                WHEN current_status::text = 'INSTALLED' THEN 'WRM_LINE'::locationenum
                ELSE 'WIP'::locationenum
            END
    """))


def downgrade():
    # Preparation data was intentionally erased during commissioning; there is
    # no safe automatic reconstruction of the deleted historical checklist.
    pass
