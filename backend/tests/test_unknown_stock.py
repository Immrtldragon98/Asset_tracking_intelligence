from types import SimpleNamespace
import pytest
from fastapi import HTTPException
from app.api.routes.inventory import _recalculate, change_quantity, set_quantity, list_inventory
from app.models.inventory_item import InventoryItem
from app.schemas.inventory import InventoryQuantityChange, InventorySetQuantity, InventoryOut


class Session:
    def __init__(self, item):
        self.item = item
        self.added = []
        self.commits = 0
    def get(self, model, item_id):
        return self.item
    def add(self, value):
        self.added.append(value)
    def commit(self):
        self.commits += 1
    def refresh(self, value):
        pass
    def query(self, *args):
        return self
    def filter(self, *args):
        return self
    def order_by(self, *args):
        return self
    def all(self):
        return [self.item]


def spare(quantity):
    return InventoryItem(id=1,name="Bearing",quantity=quantity,minimum_quantity=5,is_active=True,location="Store",expected_life_hours=None,observed_avg_life_hours=None)


def test_unknown_quantity_stays_unassessed_and_has_no_coverage():
    item = spare(None)
    _recalculate(item)
    assert item.quantity is None
    assert item.availability_pct is None
    assert item.criticality == "UNASSESSED"


def test_zero_is_distinct_from_unknown():
    item = spare(0)
    _recalculate(item)
    assert item.availability_pct == 0
    assert item.criticality == "CRITICAL"


def test_movements_require_an_opening_count():
    db = Session(spare(None))
    with pytest.raises(HTTPException) as error:
        change_quantity(1,InventoryQuantityChange(delta=2,operator="Engineer",reason="Receipt"),db,SimpleNamespace(username="admin"))
    assert error.value.status_code == 409
    assert db.added == []
    assert db.commits == 0


def test_opening_count_preserves_unknown_prior_balance():
    db = Session(spare(None))
    set_quantity(1,InventorySetQuantity(quantity=4,operator="Engineer",reason="Physical count"),db,SimpleNamespace(username="admin"))
    transaction = db.added[0]
    assert transaction.quantity_before is None
    assert transaction.quantity_change is None
    assert transaction.quantity_after == 4
    assert transaction.transaction_type == "INITIAL_COUNT"
    assert db.commits == 1


def test_inventory_reads_do_not_commit_recalculated_metrics():
    db = Session(spare(None))
    assert list_inventory(False,db)[0].quantity is None
    assert db.commits == 0
