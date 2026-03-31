from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from delivery_api.application.services.order_service import OrderService
from delivery_api.application.services.restaurant_service import RestaurantService
from delivery_api.domain.schemas import MenuItemCreate, MenuItemResponse, OrderResponse, RestaurantCreate, RestaurantResponse
from delivery_api.interfaces.api.v1.dependencies.services import get_order_service, get_restaurant_service

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    payload: RestaurantCreate,
    service: RestaurantService = Depends(get_restaurant_service),
) -> RestaurantResponse:
    restaurant = await service.create_restaurant(payload)
    return RestaurantResponse.model_validate(restaurant)


@router.get("", response_model=list[RestaurantResponse])
async def list_restaurants(service: RestaurantService = Depends(get_restaurant_service)) -> list[RestaurantResponse]:
    restaurants = await service.list_restaurants()
    return [RestaurantResponse.model_validate(restaurant) for restaurant in restaurants]


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: UUID,
    service: RestaurantService = Depends(get_restaurant_service),
) -> RestaurantResponse:
    try:
        restaurant = await service.get_restaurant(restaurant_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return RestaurantResponse.model_validate(restaurant)


@router.post("/{restaurant_id}/menu-items", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def add_menu_item(
    restaurant_id: UUID,
    payload: MenuItemCreate,
    service: RestaurantService = Depends(get_restaurant_service),
) -> MenuItemResponse:
    try:
        menu_item = await service.add_menu_item(restaurant_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return MenuItemResponse.model_validate(menu_item)


@router.get("/{restaurant_id}/menu", response_model=list[MenuItemResponse])
async def list_menu(
    restaurant_id: UUID,
    service: RestaurantService = Depends(get_restaurant_service),
) -> list[MenuItemResponse]:
    try:
        menu_items = await service.list_menu(restaurant_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return [MenuItemResponse.model_validate(menu_item) for menu_item in menu_items]


@router.get("/{restaurant_id}/orders", response_model=list[OrderResponse])
async def list_orders(
    restaurant_id: UUID,
    service: OrderService = Depends(get_order_service),
) -> list[OrderResponse]:
    orders = await service.list_orders_by_restaurant(restaurant_id)
    return [OrderResponse.model_validate(order) for order in orders]

