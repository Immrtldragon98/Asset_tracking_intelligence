"""Shared component lifecycle and reliability intelligence history.

Revision ID: 20261013_reliability_core
Revises: 20261012_maintenance_schedule
"""
from alembic import op
import sqlalchemy as sa

revision = "20261013_reliability_core"
down_revision = "20261012_maintenance_schedule"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "component_lifecycles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("module_code", sa.String(12), nullable=False),
        sa.Column("line_name", sa.String(32)),
        sa.Column("position_number", sa.Integer()),
        sa.Column("stand_code", sa.String(60)),
        sa.Column("asset_code", sa.String(100)),
        sa.Column("component_type", sa.String(80), nullable=False),
        sa.Column("component_side", sa.String(40)),
        sa.Column("serial_number", sa.String(100)),
        sa.Column("installed_on", sa.Date(), nullable=False),
        sa.Column("removed_on", sa.Date()),
        sa.Column("operating_hours_at_install", sa.Float()),
        sa.Column("operating_hours_at_removal", sa.Float()),
        sa.Column("removal_reason", sa.String(180)),
        sa.Column("condition_on_removal", sa.Text()),
        sa.Column("work_done", sa.Text()),
        sa.Column("source_text", sa.Text()),
        sa.Column("recorded_by", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    for col in ("module_code","line_name","position_number","stand_code","asset_code","component_type","serial_number","installed_on","removed_on"):
        op.create_index(f"ix_component_lifecycles_{col}", "component_lifecycles", [col])
    op.create_table(
        "reliability_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("module_code", sa.String(12), nullable=False),
        sa.Column("event_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("line_name", sa.String(32)),
        sa.Column("position_number", sa.Integer()),
        sa.Column("stand_code", sa.String(60)),
        sa.Column("asset_code", sa.String(100)),
        sa.Column("equipment", sa.String(160)),
        sa.Column("component_type", sa.String(80)),
        sa.Column("event_type", sa.String(40), nullable=False, server_default="MAINTENANCE"),
        sa.Column("failure_mode", sa.String(180)),
        sa.Column("symptoms", sa.Text()),
        sa.Column("suspected_cause", sa.Text()),
        sa.Column("confirmed_cause", sa.Text()),
        sa.Column("action_taken", sa.Text()),
        sa.Column("part_removed", sa.String(120)),
        sa.Column("part_installed", sa.String(120)),
        sa.Column("downtime_minutes", sa.Float()),
        sa.Column("operating_hours", sa.Float()),
        sa.Column("source_text", sa.Text()),
        sa.Column("ai_summary", sa.Text()),
        sa.Column("ai_confidence", sa.Float()),
        sa.Column("verification_status", sa.String(20), nullable=False, server_default="VERIFIED"),
        sa.Column("recorded_by", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    for col in ("module_code","event_at","line_name","position_number","stand_code","asset_code","equipment","component_type","event_type","failure_mode","verification_status"):
        op.create_index(f"ix_reliability_events_{col}", "reliability_events", [col])


def downgrade():
    for col in ("verification_status","failure_mode","event_type","component_type","equipment","asset_code","stand_code","position_number","line_name","event_at","module_code"):
        op.drop_index(f"ix_reliability_events_{col}", table_name="reliability_events")
    op.drop_table("reliability_events")
    for col in ("removed_on","installed_on","serial_number","component_type","asset_code","stand_code","position_number","line_name","module_code"):
        op.drop_index(f"ix_component_lifecycles_{col}", table_name="component_lifecycles")
    op.drop_table("component_lifecycles")
