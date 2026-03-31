import httpx

from delivery_api.application.ports import WebhookDispatcher
from delivery_api.domain.entities.order import Order


class HttpWebhookDispatcher(WebhookDispatcher):
    def __init__(self, timeout: float = 3.0) -> None:
        self.timeout = timeout

    async def dispatch(self, order: Order) -> None:
        if not order.webhook_urls:
            return
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for webhook_url in order.webhook_urls:
                await self._post_event(client, webhook_url, order)

    async def _post_event(self, client: httpx.AsyncClient, webhook_url: str, order: Order) -> None:
        payload = {
            "order_id": str(order.id),
            "restaurant_id": str(order.restaurant_id),
            "status": order.status.value,
            "total": str(order.total),
            "updated_at": order.updated_at.isoformat(),
        }
        try:
            await client.post(webhook_url, json=payload)
        except httpx.HTTPError:
            return

