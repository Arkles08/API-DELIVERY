from datetime import datetime
from decimal import Decimal
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from delivery_api.domain.enums import OrderStatus


PositiveMoney = Annotated[Decimal, Field(gt=0)]
PositiveQuantity = Annotated[int, Field(ge=1)]


class MenuItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=2, max_length=500)
    price: PositiveMoney


class MenuItemResponse(MenuItemCreate):
    id: UUID
    restaurant_id: UUID
    model_config = ConfigDict(from_attributes=True)


class RestaurantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=2, max_length=500)


class RestaurantResponse(RestaurantCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class CartItemCreate(BaseModel):
    menu_item_id: UUID
    quantity: PositiveQuantity = 1


class CartItemResponse(BaseModel):
    menu_item_id: UUID
    name: str
    unit_price: Decimal
    quantity: int
    subtotal: Decimal
    model_config = ConfigDict(from_attributes=True)


class CartCreate(BaseModel):
    restaurant_id: UUID


class CartResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    items: list[CartItemResponse]
    total: Decimal
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OrderCreateFromCart(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_phone: str = Field(min_length=8, max_length=30)
    webhook_url: HttpUrl | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderEventResponse(BaseModel):
    id: UUID
    order_id: UUID
    status: OrderStatus
    note: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    cart_id: UUID
    customer_name: str
    customer_phone: str
    items: list[CartItemResponse]
    status: OrderStatus
    total: Decimal
    webhook_urls: list[HttpUrl]
    events: list[OrderEventResponse]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class WebhookSubscriptionCreate(BaseModel):
    webhook_url: HttpUrl

