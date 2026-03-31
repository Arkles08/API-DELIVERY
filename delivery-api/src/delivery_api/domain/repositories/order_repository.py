from abc import ABC, abstractmethod
from uuid import UUID

from delivery_api.domain.entities.order import Order


class OrderRepository(ABC):
    @abstractmethod
    async def save(self, order: Order) -> Order:
        raise NotImplementedError

    @abstractmethod
    async def find_by_id(self, order_id: UUID) -> Order | None:
        raise NotImplementedError

    @abstractmethod
    async def list_by_restaurant(self, restaurant_id: UUID) -> list[Order]:
        raise NotImplementedError

