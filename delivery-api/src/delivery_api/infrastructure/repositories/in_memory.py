from dataclasses import dataclass, field
from uuid import UUID

from delivery_api.domain.entities.cart import Cart
from delivery_api.domain.entities.order import Order
from delivery_api.domain.entities.restaurant import MenuItem, Restaurant
from delivery_api.domain.repositories.cart_repository import CartRepository
from delivery_api.domain.repositories.order_repository import OrderRepository
from delivery_api.domain.repositories.restaurant_repository import RestaurantRepository


@dataclass(slots=True)
class InMemoryStore:
    restaurants: dict[UUID, Restaurant] = field(default_factory=dict)
    menu_items: dict[UUID, MenuItem] = field(default_factory=dict)
    carts: dict[UUID, Cart] = field(default_factory=dict)
    orders: dict[UUID, Order] = field(default_factory=dict)


class InMemoryRestaurantRepository(RestaurantRepository):
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    async def save(self, restaurant: Restaurant) -> Restaurant:
        self.store.restaurants[restaurant.id] = restaurant
        return restaurant

    async def find_by_id(self, restaurant_id: UUID) -> Restaurant | None:
        return self.store.restaurants.get(restaurant_id)

    async def list_all(self) -> list[Restaurant]:
        return list(self.store.restaurants.values())

    async def save_menu_item(self, menu_item: MenuItem) -> MenuItem:
        self.store.menu_items[menu_item.id] = menu_item
        restaurant = self.store.restaurants[menu_item.restaurant_id]
        if all(item.id != menu_item.id for item in restaurant.menu_items):
            restaurant.menu_items.append(menu_item)
        return menu_item

    async def list_menu_items(self, restaurant_id: UUID) -> list[MenuItem]:
        return [item for item in self.store.menu_items.values() if item.restaurant_id == restaurant_id]


class InMemoryCartRepository(CartRepository):
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    async def save(self, cart: Cart) -> Cart:
        self.store.carts[cart.id] = cart
        return cart

    async def find_by_id(self, cart_id: UUID) -> Cart | None:
        return self.store.carts.get(cart_id)


class InMemoryOrderRepository(OrderRepository):
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    async def save(self, order: Order) -> Order:
        self.store.orders[order.id] = order
        return order

    async def find_by_id(self, order_id: UUID) -> Order | None:
        return self.store.orders.get(order_id)

    async def list_by_restaurant(self, restaurant_id: UUID) -> list[Order]:
        return [order for order in self.store.orders.values() if order.restaurant_id == restaurant_id]

