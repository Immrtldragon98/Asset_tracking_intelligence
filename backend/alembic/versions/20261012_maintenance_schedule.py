"""Add cross-register planned maintenance schedule.

Revision ID: 20261012_maintenance_schedule
Revises: 20261011_dir_alerts
"""
from alembic import op
import sqlalchemy as sa

revision = "20261012_maintenance_schedule"
down_revision = "20261011_dir_alerts"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "maintenance_schedules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("module_code", sa.String(length=12), nullable=False, server_default="ALL"),
        sa.Column("schedule_type", sa.String(length=24), nullable=False, server_default="PM_OFFLINE"),
        sa.Column("line_name", sa.String(length=32), nullable=True),
        sa.Column("equipment", sa.String(length=180), nullable=True),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="PLANNED"),
        sa.Column("assigned_to", sa.String(length=100), nullable=True),
        sa.Column("impact", sa.Text(), nullable=True),
        sa.Column("work_scope", sa.Text(), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    for col in ("module_code", "schedule_type", "line_name", "start_at", "status"):
        op.create_index(f"ix_maintenance_schedules_{col}", "maintenance_schedules", [col])


def downgrade():
    for col in ("status", "start_at", "line_name", "schedule_type", "module_code"):
        op.drop_index(f"ix_maintenance_schedules_{col}", table_name="maintenance_schedules")
    op.drop_table("maintenance_schedules")
