from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

from delivery_api.domain.entities.cart import CartItem
from delivery_api.domain.enums import OrderStatus


@dataclass(slots=True)
class OrderEvent:
    id: UUID
    order_id: UUID
    status: OrderStatus
    note: str
    created_at: datetime


@dataclass(slots=True)
class Order:
    id: UUID
    restaurant_id: UUID
    cart_id: UUID
    customer_name: str
    customer_phone: str
    items: list[CartItem]
    status: OrderStatus
    webhook_urls: list[str] = field(default_factory=list)
    events: list[OrderEvent] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def create_from_cart(
        cls,
        restaurant_id: UUID,
        cart_id: UUID,
        customer_name: str,
        customer_phone: str,
        items: list[CartItem],
        webhook_url: str | None = None,
    ) -> "Order":
        order = cls(
            id=uuid4(),
            restaurant_id=restaurant_id,
            cart_id=cart_id,
            customer_name=customer_name,
            customer_phone=customer_phone,
            items=[item for item in items],
            status=OrderStatus.RECEBIDO,
        )
        if webhook_url:
            order.webhook_urls.append(webhook_url)
        order.register_event(OrderStatus.RECEBIDO, "Pedido criado")
        return order

    @property
    def total(self) -> Decimal:
        return sum((item.subtotal for item in self.items), Decimal("0"))

    def register_event(self, status: OrderStatus, note: str) -> OrderEvent:
        event = OrderEvent(
            id=uuid4(),
            order_id=self.id,
            status=status,
            note=note,
            created_at=datetime.now(timezone.utc),
        )
        self.events.append(event)
        self.status = status
        self.updated_at = event.created_at
        return event

    def add_webhook(self, webhook_url: str) -> None:
        if webhook_url not in self.webhook_urls:
            self.webhook_urls.append(webhook_url)

