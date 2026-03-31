# Delivery API

API de delivery simplificada, com foco em:

- cadastro de restaurantes
- cardápio por restaurante
- carrinho
- criação de pedidos
- atualização de status do pedido
- webhook para eventos de status

## Stack

- FastAPI
- Pydantic v2
- Python 3.12+

## Rodar localmente

```bash
uvicorn delivery_api.main:app --reload --app-dir src
```

## Docker

No Docker, a API fica interna ao stack e é acessada pelo frontend em `http://localhost:3010`.

## Rotas principais

- `POST /api/v1/restaurants`
- `POST /api/v1/restaurants/{restaurant_id}/menu-items`
- `POST /api/v1/carts`
- `POST /api/v1/carts/{cart_id}/items`
- `POST /api/v1/orders/from-cart/{cart_id}`
- `PATCH /api/v1/orders/{order_id}/status`
- `POST /api/v1/orders/{order_id}/webhooks`
