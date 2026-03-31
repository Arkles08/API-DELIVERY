from delivery_api.domain.schemas import CartCreate, CartItemCreate, MenuItemCreate, OrderCreateFromCart, RestaurantCreate
from delivery_api.interfaces.api.v1.dependencies.services import get_cart_service, get_order_service, get_restaurant_service, store


async def seed_demo_data() -> None:
    if store.restaurants:
        return

    restaurant_service = await get_restaurant_service()
    cart_service = await get_cart_service()
    order_service = await get_order_service()

    aurora = await restaurant_service.create_restaurant(
        RestaurantCreate(
            name="Cantina Aurora",
            description="Massas artesanais, pizzas de fermentação longa e delivery noturno.",
        )
    )
    porto = await restaurant_service.create_restaurant(
        RestaurantCreate(
            name="Brasa do Porto",
            description="Hambúrgueres artesanais, grelhados e combos premium para entrega rápida.",
        )
    )
    sabor = await restaurant_service.create_restaurant(
        RestaurantCreate(
            name="Sabor da Vila",
            description="Comida brasileira de panela, pratos executivos e porções para família.",
        )
    )
    oriental = await restaurant_service.create_restaurant(
        RestaurantCreate(
            name="Kado Sushi Bar",
            description="Comida japonesa, combinados e temakis preparados na hora.",
        )
    )
    forno = await restaurant_service.create_restaurant(
        RestaurantCreate(
            name="Forno & Massa",
            description="Massa fresca, lasanhas, nhoques e sobremesas italianas clássicas.",
        )
    )
    sertao = await restaurant_service.create_restaurant(
        RestaurantCreate(
            name="Sabor do Sertao",
            description="Buchada, baião e receitas tipicas do sertao nordestino.",
        )
    )

    aurora_items = [
        await restaurant_service.add_menu_item(
            aurora.id,
            MenuItemCreate(
                name="Pizza Margherita",
                description="Molho de tomate, muçarela, parmesão e manjericão fresco.",
                price="42.90",
            ),
        ),
        await restaurant_service.add_menu_item(
            aurora.id,
            MenuItemCreate(
                name="Lasanha da Casa",
                description="Massa fresca, ragù bovino e molho bechamel.",
                price="49.50",
            ),
        ),
    ]

    await restaurant_service.add_menu_item(
        porto.id,
        MenuItemCreate(
            name="Burger Brasa Classic",
            description="Blend angus, queijo cheddar, cebola caramelizada e batatas rústicas.",
            price="38.90",
        ),
    )
    await restaurant_service.add_menu_item(
        porto.id,
        MenuItemCreate(
            name="Combo Duo Grill",
            description="Dois smash burgers, molho da casa e refrigerante 600 ml.",
            price="61.80",
        ),
    )

    await restaurant_service.add_menu_item(
        sabor.id,
        MenuItemCreate(
            name="PF Executivo de Frango",
            description="Arroz, feijão, frango grelhado, salada e farofa crocante.",
            price="34.90",
        ),
    )
    await restaurant_service.add_menu_item(
        sabor.id,
        MenuItemCreate(
            name="Baião da Casa",
            description="Arroz, feijão-de-corda, carne de sol, queijo coalho e vinagrete.",
            price="39.50",
        ),
    )

    await restaurant_service.add_menu_item(
        oriental.id,
        MenuItemCreate(
            name="Combinado Kado 24 peças",
            description="Sashimis, hot rolls, niguiris e uramakis selecionados.",
            price="79.90",
        ),
    )
    await restaurant_service.add_menu_item(
        oriental.id,
        MenuItemCreate(
            name="Temaki Salmão Premium",
            description="Salmão fresco, cream cheese e cebolinha na alga crocante.",
            price="31.90",
        ),
    )

    forno_items = [
        await restaurant_service.add_menu_item(
            forno.id,
            MenuItemCreate(
                name="Tagliatelle al Ragù",
                description="Massa fresca com ragù bovino de cozimento lento e parmesão.",
                price="47.90",
            ),
        ),
        await restaurant_service.add_menu_item(
            forno.id,
            MenuItemCreate(
                name="Gnocchi al Pesto",
                description="Nhoque artesanal com pesto de manjericão, rúcula e nozes.",
                price="44.90",
            ),
        ),
    ]

    await restaurant_service.add_menu_item(
        sertao.id,
        MenuItemCreate(
            name="Baião Completo",
            description="Baião de dois com carne de sol, queijo coalho e manteiga de garrafa.",
            price="41.90",
        ),
    )
    await restaurant_service.add_menu_item(
        sertao.id,
        MenuItemCreate(
            name="Mix Sertanejo",
            description="Porção com macaxeira frita, carne de sol acebolada e vinagrete da casa.",
            price="46.50",
        ),
    )

    cart = await cart_service.create_cart(CartCreate(restaurant_id=aurora.id))
    await cart_service.add_item(cart.id, CartItemCreate(menu_item_id=aurora_items[0].id, quantity=1))
    await cart_service.add_item(cart.id, CartItemCreate(menu_item_id=aurora_items[1].id, quantity=1))

    await order_service.create_from_cart(
        cart.id,
        OrderCreateFromCart(
            customer_name="Mariana Silva",
            customer_phone="(11) 99999-9999",
        ),
    )

    forno_cart = await cart_service.create_cart(CartCreate(restaurant_id=forno.id))
    await cart_service.add_item(forno_cart.id, CartItemCreate(menu_item_id=forno_items[0].id, quantity=1))
    await cart_service.add_item(forno_cart.id, CartItemCreate(menu_item_id=forno_items[1].id, quantity=1))

    await order_service.create_from_cart(
        forno_cart.id,
        OrderCreateFromCart(
            customer_name="Carlos Mendes",
            customer_phone="(21) 98888-7777",
        ),
    )
