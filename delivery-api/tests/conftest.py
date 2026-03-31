from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient


project_root = Path(__file__).resolve().parents[1]
src_path = project_root / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from delivery_api.application.ports import WebhookDispatcher
from delivery_api.domain.entities.order import Order
from delivery_api.interfaces.api.v1.dependencies import services as dependency_services
from delivery_api.main import create_app


class RecordingWebhookDispatcher(WebhookDispatcher):
    def __init__(self) -> None:
        self.dispatched_orders: list[Order] = []

    async def dispatch(self, order: Order) -> None:
        self.dispatched_orders.append(order)


@pytest.fixture()
def webhook_dispatcher() -> RecordingWebhookDispatcher:
    return RecordingWebhookDispatcher()


@pytest.fixture()
def app(webhook_dispatcher: RecordingWebhookDispatcher):
    dependency_services.webhook_dispatcher = webhook_dispatcher
    return create_app()


@pytest.fixture()
def client(app):
    with TestClient(app) as test_client:
        yield test_client

