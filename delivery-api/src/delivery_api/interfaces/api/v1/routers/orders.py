from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from delivery_api.application.services.order_service import OrderService
from delivery_api.domain.schemas import (
    OrderCreateFromCart,
    OrderEventResponse,
    OrderResponse,
    OrderStatusUpdate,
    WebhookSubscriptionCreate,
)
from delivery_api.interfaces.api.v1.dependencies.services import get_order_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/from-cart/{cart_id}", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_from_cart(
    cart_id: UUID,
    payload: OrderCreateFromCart,
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    try:
        order = await service.create_from_cart(cart_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return OrderResponse.model_validate(order)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: UUID, service: OrderService = Depends(get_order_service)) -> OrderResponse:
    try:
        order = await service.get_order(order_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return OrderResponse.model_validate(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_status(
    order_id: UUID,
    payload: OrderStatusUpdate,
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    try:
        order = await service.change_status(order_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return OrderResponse.model_validate(order)


@router.post("/{order_id}/webhooks", response_model=OrderResponse)
async def add_webhook(
    order_id: UUID,
    payload: WebhookSubscriptionCreate,
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    try:
        order = await service.add_webhook(order_id, str(payload.webhook_url))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return OrderResponse.model_validate(order)


@router.get("/{order_id}/events", response_model=list[OrderEventResponse])
async def list_events(order_id: UUID, service: OrderService = Depends(get_order_service)) -> list[OrderEventResponse]:
    try:
        order = await service.get_order(order_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return [OrderEventResponse.model_validate(event) for event in order.events]



