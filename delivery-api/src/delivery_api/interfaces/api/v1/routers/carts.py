from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from delivery_api.application.services.cart_service import CartService
from delivery_api.domain.schemas import CartCreate, CartItemCreate, CartResponse
from delivery_api.interfaces.api.v1.dependencies.services import get_cart_service

router = APIRouter(prefix="/carts", tags=["carts"])


@router.post("", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
async def create_cart(
    payload: CartCreate,
    service: CartService = Depends(get_cart_service),
) -> CartResponse:
    try:
        cart = await service.create_cart(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return CartResponse.model_validate(cart)


@router.post("/{cart_id}/items", response_model=CartResponse)
async def add_item(
    cart_id: UUID,
    payload: CartItemCreate,
    service: CartService = Depends(get_cart_service),
) -> CartResponse:
    try:
        cart = await service.add_item(cart_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return CartResponse.model_validate(cart)


@router.get("/{cart_id}", response_model=CartResponse)
async def get_cart(cart_id: UUID, service: CartService = Depends(get_cart_service)) -> CartResponse:
    try:
        cart = await service.get_cart(cart_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return CartResponse.model_validate(cart)


@router.delete("/{cart_id}/items/{menu_item_id}", response_model=CartResponse)
async def remove_item(
    cart_id: UUID,
    menu_item_id: UUID,
    service: CartService = Depends(get_cart_service),
) -> CartResponse:
    try:
        cart = await service.remove_item(cart_id, menu_item_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return CartResponse.model_validate(cart)

