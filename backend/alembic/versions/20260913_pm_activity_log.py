"""Add maintenance activity-log fields to PM activities.

Revision ID: 20260913_pm_activity_log
Revises: 20260912_pm_activities
"""

from alembic import op
import sqlalchemy as sa


revision = "20260913_pm_activity_log"
down_revision = "20260912_pm_activities"
branch_labels = None
depends_on = None


def upgrade():
    columns = [
        ("shift", sa.String(length=8)),
        ("position_number", sa.Integer()),
        ("stand_code", sa.String(length=50)),
        ("component", sa.String(length=100)),
        ("activity_type", sa.String(length=60)),
        ("from_value", sa.String(length=100)),
        ("to_value", sa.String(length=100)),
        ("source_text", sa.Text()),
    ]

    for name, column_type in columns:
        op.add_column(
            "pm_activities",
            sa.Column(name, column_type, nullable=True),
        )


def downgrade():
    for name in [
        "source_text",
        "to_value",
        "from_value",
        "activity_type",
        "component",
        "stand_code",
        "position_number",
        "shift",
    ]:
        op.drop_column("pm_activities", name)
