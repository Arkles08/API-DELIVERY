from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4


@dataclass(slots=True)
class CartItem:
    menu_item_id: UUID
    name: str
    unit_price: Decimal
    quantity: int

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass(slots=True)
class Cart:
    id: UUID
    restaurant_id: UUID
    items: list[CartItem] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def create(cls, restaurant_id: UUID) -> "Cart":
        return cls(id=uuid4(), restaurant_id=restaurant_id)

    @property
    def total(self) -> Decimal:
        return sum((item.subtotal for item in self.items), Decimal("0"))

    def add_item(self, item: CartItem) -> None:
        for existing_item in self.items:
            if existing_item.menu_item_id == item.menu_item_id:
                existing_item.quantity += item.quantity
                return
        self.items.append(item)

    def remove_item(self, menu_item_id: UUID) -> bool:
        initial_count = len(self.items)
        self.items = [item for item in self.items if item.menu_item_id != menu_item_id]
        return len(self.items) != initial_count

