from delivery_api.application.ports import WebhookDispatcher
from delivery_api.application.services.cart_service import CartService
from delivery_api.application.services.order_service import OrderService
from delivery_api.application.services.restaurant_service import RestaurantService
from delivery_api.infrastructure.external.http_webhook_dispatcher import HttpWebhookDispatcher
from delivery_api.infrastructure.repositories.in_memory import (
    InMemoryCartRepository,
    InMemoryOrderRepository,
    InMemoryRestaurantRepository,
    InMemoryStore,
)

store = InMemoryStore()
restaurant_repository = InMemoryRestaurantRepository(store)
cart_repository = InMemoryCartRepository(store)
order_repository = InMemoryOrderRepository(store)
webhook_dispatcher = HttpWebhookDispatcher()


async def get_restaurant_service() -> RestaurantService:
    return RestaurantService(restaurant_repository)


async def get_cart_service() -> CartService:
    return CartService(cart_repository, restaurant_repository)


async def get_order_service() -> OrderService:
    return OrderService(cart_repository, order_repository, webhook_dispatcher)


async def get_webhook_dispatcher() -> WebhookDispatcher:
    return webhook_dispatcher

