from uuid import UUID


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_restaurant_cart_and_order_flow(client):
    restaurant_response = client.post(
        "/api/v1/restaurants",
        json={"name": "Cantina Central", "description": "Massas e pizzas artesanais"},
    )
    assert restaurant_response.status_code == 201
    restaurant_id = restaurant_response.json()["id"]

    menu_response = client.post(
        f"/api/v1/restaurants/{restaurant_id}/menu-items",
        json={"name": "Pizza Margherita", "description": "Molho, muçarela e manjericão", "price": "42.50"},
    )
    assert menu_response.status_code == 201
    menu_item_id = menu_response.json()["id"]

    cart_response = client.post(
        "/api/v1/carts",
        json={"restaurant_id": restaurant_id},
    )
    assert cart_response.status_code == 201
    cart_id = cart_response.json()["id"]

    add_item_response = client.post(
        f"/api/v1/carts/{cart_id}/items",
        json={"menu_item_id": menu_item_id, "quantity": 2},
    )
    assert add_item_response.status_code == 200
    assert add_item_response.json()["total"] == "85.00"

    order_response = client.post(
        f"/api/v1/orders/from-cart/{cart_id}",
        json={"customer_name": "João", "customer_phone": "11999999999"},
    )
    assert order_response.status_code == 201
    order_id = order_response.json()["id"]
    assert order_response.json()["status"] == "recebido"

    in_transit_response = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "a_caminho"},
    )
    assert in_transit_response.status_code == 200
    assert in_transit_response.json()["status"] == "a_caminho"

    delivered_response = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "entregue"},
    )
    assert delivered_response.status_code == 200
    assert delivered_response.json()["status"] == "entregue"

    events_response = client.get(f"/api/v1/orders/{order_id}/events")
    assert events_response.status_code == 200
    assert len(events_response.json()) == 3

