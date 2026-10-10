"""Add DIR usage tracking and maintenance alerts.

Revision ID: 20261011_dir_alerts
Revises: 20261008_reset_stand_preparation
"""
from alembic import op
import sqlalchemy as sa

revision = "20261011_dir_alerts"
down_revision = "20261008_reset_stand_preparation"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("drive_inventory", sa.Column("installation_date", sa.Date(), nullable=True))
    op.add_column("drive_inventory", sa.Column("running_hours", sa.Float(), nullable=False, server_default="0"))
    op.create_table(
        "maintenance_alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("asset_code", sa.String(length=100), nullable=True),
        sa.Column("module_code", sa.String(length=20), nullable=True),
        sa.Column("severity", sa.String(length=20), nullable=False, server_default="MEDIUM"),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="OPEN"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_maintenance_alerts_asset_code", "maintenance_alerts", ["asset_code"])
    op.create_index("ix_maintenance_alerts_module_code", "maintenance_alerts", ["module_code"])
    op.create_index("ix_maintenance_alerts_status", "maintenance_alerts", ["status"])


def downgrade():
    op.drop_index("ix_maintenance_alerts_status", table_name="maintenance_alerts")
    op.drop_index("ix_maintenance_alerts_module_code", table_name="maintenance_alerts")
    op.drop_index("ix_maintenance_alerts_asset_code", table_name="maintenance_alerts")
    op.drop_table("maintenance_alerts")
    op.drop_column("drive_inventory", "running_hours")
    op.drop_column("drive_inventory", "installation_date")
