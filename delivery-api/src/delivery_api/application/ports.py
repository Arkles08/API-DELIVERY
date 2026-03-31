from typing import Protocol

from delivery_api.domain.entities.order import Order


class WebhookDispatcher(Protocol):
    async def dispatch(self, order: Order) -> None:
        raise NotImplementedError

