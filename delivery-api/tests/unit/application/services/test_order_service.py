from decimal import Decimal
from uuid import uuid4

import pytest

from delivery_api.application.ports import WebhookDispatcher
from delivery_api.application.services.order_service import OrderService
from delivery_api.domain.entities.cart import Cart, CartItem
from delivery_api.domain.entities.order import Order
from delivery_api.domain.enums import OrderStatus
from delivery_api.infrastructure.repositories.in_memory import (
    InMemoryCartRepository,
    InMemoryOrderRepository,
    InMemoryStore,
)


class FakeDispatcher(WebhookDispatcher):
    def __init__(self) -> None:
        self.orders: list[Order] = []

    async def dispatch(self, order: Order) -> None:
        self.orders.append(order)


@pytest.mark.asyncio
async def test_create_from_cart_changes_status_and_dispatches_webhook() -> None:
    store = InMemoryStore()
    cart_repository = InMemoryCartRepository(store)
    order_repository = InMemoryOrderRepository(store)
    dispatcher = FakeDispatcher()
    service = OrderService(cart_repository, order_repository, dispatcher)

    cart = Cart(id=uuid4(), restaurant_id=uuid4())
    cart.add_item(CartItem(uuid4(), "Pizza", Decimal("45.00"), 2))
    await cart_repository.save(cart)

    order = await service.create_from_cart(
        cart.id,
        type("Payload", (), {"customer_name": "Ana", "customer_phone": "11999999999", "webhook_url": None})(),
    )

    assert order.status == OrderStatus.RECEBIDO
    assert order.total == Decimal("90.00")
    assert len(dispatcher.orders) == 1


@pytest.mark.asyncio
async def test_invalid_status_transition_fails() -> None:
    store = InMemoryStore()
    cart_repository = InMemoryCartRepository(store)
    order_repository = InMemoryOrderRepository(store)
    dispatcher = FakeDispatcher()
    service = OrderService(cart_repository, order_repository, dispatcher)

    order = Order.create_from_cart(
        restaurant_id=uuid4(),
        cart_id=uuid4(),
        customer_name="Ana",
        customer_phone="11999999999",
        items=[],
    )
    await order_repository.save(order)

    with pytest.raises(ValueError):
        await service.change_status(order.id, type("Payload", (), {"status": OrderStatus.ENTREGUE})())

