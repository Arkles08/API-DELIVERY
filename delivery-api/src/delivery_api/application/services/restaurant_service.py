from uuid import UUID

from delivery_api.domain.entities.restaurant import MenuItem, Restaurant
from delivery_api.domain.repositories.restaurant_repository import RestaurantRepository
from delivery_api.domain.schemas import MenuItemCreate, RestaurantCreate


class RestaurantService:
    def __init__(self, restaurant_repository: RestaurantRepository) -> None:
        self.restaurant_repository = restaurant_repository

    async def create_restaurant(self, payload: RestaurantCreate) -> Restaurant:
        restaurant = Restaurant.create(payload.name, payload.description)
        return await self.restaurant_repository.save(restaurant)

    async def list_restaurants(self) -> list[Restaurant]:
        return await self.restaurant_repository.list_all()

    async def get_restaurant(self, restaurant_id: UUID) -> Restaurant:
        restaurant = await self.restaurant_repository.find_by_id(restaurant_id)
        if restaurant is None:
            raise ValueError("Restaurant not found")
        return restaurant

    async def add_menu_item(self, restaurant_id: UUID, payload: MenuItemCreate) -> MenuItem:
        restaurant = await self.get_restaurant(restaurant_id)
        menu_item = restaurant.add_menu_item(payload)
        await self.restaurant_repository.save_menu_item(menu_item)
        return menu_item

    async def list_menu(self, restaurant_id: UUID) -> list[MenuItem]:
        await self.get_restaurant(restaurant_id)
        return await self.restaurant_repository.list_menu_items(restaurant_id)

