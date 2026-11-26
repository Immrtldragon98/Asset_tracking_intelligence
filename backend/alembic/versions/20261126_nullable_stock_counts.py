"""Preserve unrecorded stock and explicit opening-count ledger entries."""
from alembic import op
import sqlalchemy as sa

revision = "20261126_nullable_stock_counts"
down_revision = "20261013_reliability_core"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("inventory_items", "quantity", existing_type=sa.Integer(), nullable=True, server_default=None)
    op.alter_column("inventory_transactions", "quantity_before", existing_type=sa.Integer(), nullable=True)
    op.alter_column("inventory_transactions", "quantity_change", existing_type=sa.Integer(), nullable=True)


def downgrade():
    # Unknown stock must be reviewed; it cannot safely be rewritten as zero.
    connection = op.get_bind()
    missing = connection.execute(sa.text("SELECT (SELECT count(*) FROM inventory_items WHERE quantity IS NULL) + (SELECT count(*) FROM inventory_transactions WHERE quantity_before IS NULL OR quantity_change IS NULL)")).scalar_one()
    if missing:
        raise RuntimeError("Review unknown stock/opening counts before downgrading")
    op.alter_column("inventory_transactions", "quantity_change", existing_type=sa.Integer(), nullable=False)
    op.alter_column("inventory_transactions", "quantity_before", existing_type=sa.Integer(), nullable=False)
    op.alter_column("inventory_items", "quantity", existing_type=sa.Integer(), nullable=False, server_default="0")
