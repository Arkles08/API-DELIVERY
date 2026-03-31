from datetime import datetime, timedelta, timezone
from uuid import UUID

from delivery_api.application.ports import WebhookDispatcher
from delivery_api.domain.entities.order import Order
from delivery_api.domain.enums import OrderStatus
from delivery_api.domain.repositories.cart_repository import CartRepository
from delivery_api.domain.repositories.order_repository import OrderRepository
from delivery_api.domain.schemas import OrderCreateFromCart, OrderStatusUpdate


class OrderService:
    def __init__(
        self,
        cart_repository: CartRepository,
        order_repository: OrderRepository,
        webhook_dispatcher: WebhookDispatcher,
    ) -> None:
        self.cart_repository = cart_repository
        self.order_repository = order_repository
        self.webhook_dispatcher = webhook_dispatcher

    async def create_from_cart(self, cart_id: UUID, payload: OrderCreateFromCart) -> Order:
        cart = await self.cart_repository.find_by_id(cart_id)
        if cart is None:
            raise ValueError("Cart not found")
        if not cart.items:
            raise ValueError("Cart is empty")
        order = Order.create_from_cart(
            restaurant_id=cart.restaurant_id,
            cart_id=cart.id,
            customer_name=payload.customer_name,
            customer_phone=payload.customer_phone,
            items=cart.items,
            webhook_url=str(payload.webhook_url) if payload.webhook_url else None,
        )
        saved_order = await self.order_repository.save(order)
        await self.webhook_dispatcher.dispatch(saved_order)
        return saved_order

    async def change_status(self, order_id: UUID, payload: OrderStatusUpdate) -> Order:
        order = await self.get_order(order_id)
        self._validate_transition(order.status, payload.status)
        event_note = f"Status atualizado para {payload.status.value}"
        order.register_event(payload.status, event_note)
        saved_order = await self.order_repository.save(order)
        await self.webhook_dispatcher.dispatch(saved_order)
        return saved_order

    async def add_webhook(self, order_id: UUID, webhook_url: str) -> Order:
        order = await self.get_order(order_id)
        order.add_webhook(webhook_url)
        return await self.order_repository.save(order)

    async def list_orders_by_restaurant(self, restaurant_id: UUID) -> list[Order]:
        orders = await self.order_repository.list_by_restaurant(restaurant_id)
        updated_orders: list[Order] = []
        for order in orders:
            updated_orders.append(await self._apply_time_based_progress(order))
        return updated_orders

    async def get_order(self, order_id: UUID) -> Order:
        order = await self.order_repository.find_by_id(order_id)
        if order is None:
            raise ValueError("Order not found")
        return await self._apply_time_based_progress(order)

    def _validate_transition(self, current_status: OrderStatus, new_status: OrderStatus) -> None:
        allowed = {
            OrderStatus.RECEBIDO: {OrderStatus.A_CAMINHO},
            OrderStatus.A_CAMINHO: {OrderStatus.ENTREGUE},
            OrderStatus.ENTREGUE: set(),
        }
        if new_status == current_status:
            return
        if new_status not in allowed[current_status]:
            raise ValueError("Invalid order status transition")

    async def _apply_time_based_progress(self, order: Order) -> Order:
        if order.status != OrderStatus.RECEBIDO:
            return order

        now = datetime.now(timezone.utc)
        if now - order.created_at < timedelta(minutes=2):
            return order

        order.register_event(OrderStatus.A_CAMINHO, "Pedido a caminho")
        saved_order = await self.order_repository.save(order)
        await self.webhook_dispatcher.dispatch(saved_order)
        return saved_order

