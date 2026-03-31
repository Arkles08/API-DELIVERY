from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID, uuid4

from delivery_api.domain.schemas import MenuItemCreate


@dataclass(slots=True)
class MenuItem:
    id: UUID
    restaurant_id: UUID
    name: str
    description: str
    price: Decimal


@dataclass(slots=True)
class Restaurant:
    id: UUID
    name: str
    description: str
    menu_items: list[MenuItem] = field(default_factory=list)

    @classmethod
    def create(cls, name: str, description: str) -> "Restaurant":
        return cls(id=uuid4(), name=name, description=description)

    def add_menu_item(self, payload: MenuItemCreate) -> MenuItem:
        menu_item = MenuItem(
            id=uuid4(),
            restaurant_id=self.id,
            name=payload.name,
            description=payload.description,
            price=payload.price,
        )
        self.menu_items.append(menu_item)
        return menu_item

