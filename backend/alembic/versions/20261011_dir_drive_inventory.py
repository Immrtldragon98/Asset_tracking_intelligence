"""Create dedicated DIR drive inventory table.

Revision ID: 20261011_dir_drive_inventory
Revises: 20261008_reset_stand_preparation
"""
from alembic import op
import sqlalchemy as sa

revision = "20261011_dir_drive_inventory"
down_revision = "20261008_reset_stand_preparation"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "drive_inventory",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source_row", sa.Integer(), nullable=False, unique=True),
        sa.Column("area", sa.String(120)),
        sa.Column("location", sa.String(160)),
        sa.Column("equipment_name", sa.String(200), nullable=False),
        sa.Column("supply_from", sa.String(160)),
        sa.Column("panel_location", sa.String(160)),
        sa.Column("vfd_make", sa.String(120)),
        sa.Column("vfd_rating", sa.String(80)),
        sa.Column("module_quantity", sa.String(40)),
        sa.Column("model_no", sa.String(160)),
        sa.Column("spare_available", sa.String(120)),
        sa.Column("spare_location", sa.String(200)),
        sa.Column("ip_address", sa.String(80)),
        sa.Column("module_power_supply", sa.String(120)),
        sa.Column("motor_kw", sa.Float()),
        sa.Column("voltage", sa.String(40)),
        sa.Column("motor_rpm", sa.Float()),
        sa.Column("motor_flc_amp", sa.Float()),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_drive_inventory_source_row", "drive_inventory", ["source_row"])


def downgrade():
    op.drop_index("ix_drive_inventory_source_row", table_name="drive_inventory")
    op.drop_table("drive_inventory")
