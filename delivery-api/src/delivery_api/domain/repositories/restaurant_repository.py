from abc import ABC, abstractmethod
from uuid import UUID

from delivery_api.domain.entities.restaurant import MenuItem, Restaurant


class RestaurantRepository(ABC):
    @abstractmethod
    async def save(self, restaurant: Restaurant) -> Restaurant:
        raise NotImplementedError

    @abstractmethod
    async def find_by_id(self, restaurant_id: UUID) -> Restaurant | None:
        raise NotImplementedError

    @abstractmethod
    async def list_all(self) -> list[Restaurant]:
        raise NotImplementedError

    @abstractmethod
    async def save_menu_item(self, menu_item: MenuItem) -> MenuItem:
        raise NotImplementedError

    @abstractmethod
    async def list_menu_items(self, restaurant_id: UUID) -> list[MenuItem]:
        raise NotImplementedError

