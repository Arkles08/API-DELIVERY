from uuid import UUID

from delivery_api.domain.entities.cart import CartItem
from delivery_api.domain.entities.cart import Cart
from delivery_api.domain.entities.restaurant import MenuItem
from delivery_api.domain.repositories.cart_repository import CartRepository
from delivery_api.domain.repositories.restaurant_repository import RestaurantRepository
from delivery_api.domain.schemas import CartCreate, CartItemCreate


class CartService:
    def __init__(
        self,
        cart_repository: CartRepository,
        restaurant_repository: RestaurantRepository,
    ) -> None:
        self.cart_repository = cart_repository
        self.restaurant_repository = restaurant_repository

    async def create_cart(self, payload: CartCreate) -> Cart:
        restaurant = await self.restaurant_repository.find_by_id(payload.restaurant_id)
        if restaurant is None:
            raise ValueError("Restaurant not found")
        cart = Cart.create(payload.restaurant_id)
        return await self.cart_repository.save(cart)

    async def add_item(self, cart_id: UUID, payload: CartItemCreate) -> Cart:
        cart = await self._get_cart(cart_id)
        menu_item = await self._get_menu_item(cart.restaurant_id, payload.menu_item_id)
        cart.add_item(
            CartItem(
                menu_item_id=menu_item.id,
                name=menu_item.name,
                unit_price=menu_item.price,
                quantity=payload.quantity,
            )
        )
        return await self.cart_repository.save(cart)

    async def get_cart(self, cart_id: UUID) -> Cart:
        return await self._get_cart(cart_id)

    async def remove_item(self, cart_id: UUID, menu_item_id: UUID) -> Cart:
        cart = await self._get_cart(cart_id)
        removed = cart.remove_item(menu_item_id)
        if not removed:
            raise ValueError("Cart item not found")
        return await self.cart_repository.save(cart)

    async def _get_cart(self, cart_id: UUID) -> Cart:
        cart = await self.cart_repository.find_by_id(cart_id)
        if cart is None:
            raise ValueError("Cart not found")
        return cart

    async def _get_menu_item(self, restaurant_id: UUID, menu_item_id: UUID) -> MenuItem:
        menu_items = await self.restaurant_repository.list_menu_items(restaurant_id)
        for menu_item in menu_items:
            if menu_item.id == menu_item_id:
                return menu_item
        raise ValueError("Menu item not found")

