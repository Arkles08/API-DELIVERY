from abc import ABC, abstractmethod
from uuid import UUID

from delivery_api.domain.entities.cart import Cart


class CartRepository(ABC):
    @abstractmethod
    async def save(self, cart: Cart) -> Cart:
        raise NotImplementedError

    @abstractmethod
    async def find_by_id(self, cart_id: UUID) -> Cart | None:
        raise NotImplementedError

