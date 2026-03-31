import { requestJson } from '../../../shared/services/api';
import type {
  Cart,
  CartCreatePayload,
  CartItemCreatePayload,
  MenuItem,
  MenuItemCreatePayload,
  Order,
  OrderCreatePayload,
  OrderStatus,
  Restaurant,
  RestaurantCreatePayload,
} from '../types/delivery.types';

type MockDatabase = {
  version: number;
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  carts: Cart[];
  orders: Order[];
};

const MOCK_DB_STORAGE_KEY = 'delivery:mock-db:v1';
const MOCK_MODE_STORAGE_KEY = 'delivery:mock-mode';
const ENV_MOCK_MODE = String(import.meta.env.VITE_DELIVERY_MOCK_MODE ?? 'false').toLowerCase() === 'true';

const INITIAL_RESTAURANTS: Array<{ name: string; description: string; menu: Array<{ name: string; description: string; price: string }> }> = [
  {
    name: 'Cantina Aurora',
    description: 'Massas artesanais, pizzas de fermentação longa e delivery noturno.',
    menu: [
      { name: 'Pizza Margherita', description: 'Molho de tomate, muçarela, parmesão e manjericão fresco.', price: '42.90' },
      { name: 'Lasanha da Casa', description: 'Massa fresca, ragù bovino e molho bechamel.', price: '49.50' },
    ],
  },
  {
    name: 'Brasa do Porto',
    description: 'Hambúrgueres artesanais, grelhados e combos premium para entrega rápida.',
    menu: [
      { name: 'Burger Brasa Classic', description: 'Blend angus, cheddar, cebola caramelizada e batatas rústicas.', price: '38.90' },
      { name: 'Combo Duo Grill', description: 'Dois smash burgers, molho da casa e refrigerante 600 ml.', price: '61.80' },
    ],
  },
  {
    name: 'Sabor da Vila',
    description: 'Comida brasileira de panela, pratos executivos e porções para família.',
    menu: [
      { name: 'PF Executivo de Frango', description: 'Arroz, feijão, frango grelhado, salada e farofa crocante.', price: '34.90' },
      { name: 'Baião da Casa', description: 'Arroz, feijão-de-corda, carne de sol, queijo coalho e vinagrete.', price: '39.50' },
    ],
  },
  {
    name: 'Kado Sushi Bar',
    description: 'Comida japonesa, combinados e temakis preparados na hora.',
    menu: [
      { name: 'Combinado Kado 24 peças', description: 'Sashimis, hot rolls, niguiris e uramakis selecionados.', price: '79.90' },
      { name: 'Temaki Salmão Premium', description: 'Salmão fresco, cream cheese e cebolinha na alga crocante.', price: '31.90' },
    ],
  },
  {
    name: 'Forno & Massa',
    description: 'Massa fresca, lasanhas, nhoques e sobremesas italianas clássicas.',
    menu: [
      { name: 'Tagliatelle al Ragù', description: 'Massa fresca com ragù bovino de cozimento lento e parmesão.', price: '47.90' },
      { name: 'Gnocchi al Pesto', description: 'Nhoque artesanal com pesto de manjericão, rúcula e nozes.', price: '44.90' },
    ],
  },
  {
    name: 'Sabor do Sertao',
    description: 'Buchada, baião e receitas tipicas do sertao nordestino.',
    menu: [
      { name: 'Baião Completo', description: 'Baião de dois com carne de sol, queijo coalho e manteiga de garrafa.', price: '41.90' },
      { name: 'Mix Sertanejo', description: 'Macaxeira frita, carne de sol acebolada e vinagrete da casa.', price: '46.50' },
    ],
  },
];

function delay(ms = 80): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toMoney(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

function toNumber(value: string): number {
  return Number.parseFloat(value) || 0;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isMockModeEnabled(): boolean {
  if (!isBrowser()) {
    return ENV_MOCK_MODE;
  }

  const override = window.localStorage.getItem(MOCK_MODE_STORAGE_KEY);
  if (override === 'on') {
    return true;
  }
  if (override === 'off') {
    return false;
  }

  return ENV_MOCK_MODE;
}

export function setMockModeEnabled(enabled: boolean): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(MOCK_MODE_STORAGE_KEY, enabled ? 'on' : 'off');
}

function buildInitialMockDb(): MockDatabase {
  const restaurants: Restaurant[] = [];
  const menuItems: MenuItem[] = [];

  INITIAL_RESTAURANTS.forEach((seedRestaurant) => {
    const restaurantId = newId();
    restaurants.push({
      id: restaurantId,
      name: seedRestaurant.name,
      description: seedRestaurant.description,
    });

    seedRestaurant.menu.forEach((seedItem) => {
      menuItems.push({
        id: newId(),
        restaurant_id: restaurantId,
        name: seedItem.name,
        description: seedItem.description,
        price: seedItem.price,
      });
    });
  });

  return {
    version: 1,
    restaurants,
    menuItems,
    carts: [],
    orders: [],
  };
}

function readMockDb(): MockDatabase {
  const fallback = buildInitialMockDb();
  if (!isBrowser()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(MOCK_DB_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as MockDatabase;
    if (!parsed || parsed.version !== 1) {
      window.localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
    return parsed;
  } catch {
    window.localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function writeMockDb(nextDb: MockDatabase): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(nextDb));
}

function computeCartTotal(items: Cart['items']): string {
  const total = items.reduce((acc, item) => acc + toNumber(item.subtotal), 0);
  return toMoney(total);
}

function getCartOrThrow(db: MockDatabase, cartId: string): Cart {
  const cart = db.carts.find((item) => item.id === cartId);
  if (!cart) {
    throw new Error('Cart not found');
  }
  return cart;
}

function getOrderOrThrow(db: MockDatabase, orderId: string): Order {
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
}

function maybeAutoProgressOrder(order: Order): boolean {
  if (order.status !== 'recebido') {
    return false;
  }

  const createdAt = new Date(order.created_at).getTime();
  if (Number.isNaN(createdAt)) {
    return false;
  }

  const elapsedMs = Date.now() - createdAt;
  if (elapsedMs < 2 * 60 * 1000) {
    return false;
  }

  const now = new Date().toISOString();
  order.status = 'a_caminho';
  order.updated_at = now;
  order.events.push({
    id: newId(),
    order_id: order.id,
    status: 'a_caminho',
    note: 'Pedido a caminho',
    created_at: now,
  });
  return true;
}

async function withMock<T>(operation: (db: MockDatabase) => T, shouldPersist = true): Promise<T> {
  const db = readMockDb();
  const result = operation(db);
  if (shouldPersist) {
    writeMockDb(db);
  }
  await delay();
  return clone(result);
}

export async function listRestaurants(): Promise<Restaurant[]> {
  if (isMockModeEnabled()) {
    return withMock((db) => db.restaurants, false);
  }

  return requestJson<Restaurant[]>('/restaurants');
}

export async function createRestaurant(payload: RestaurantCreatePayload): Promise<Restaurant> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const restaurant: Restaurant = {
        id: newId(),
        name: payload.name,
        description: payload.description,
      };
      db.restaurants.push(restaurant);
      return restaurant;
    });
  }

  return requestJson<Restaurant>('/restaurants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addMenuItem(restaurantId: string, payload: MenuItemCreatePayload): Promise<MenuItem> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const restaurant = db.restaurants.find((item) => item.id === restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const menuItem: MenuItem = {
        id: newId(),
        restaurant_id: restaurantId,
        name: payload.name,
        description: payload.description,
        price: payload.price,
      };
      db.menuItems.push(menuItem);
      return menuItem;
    });
  }

  return requestJson<MenuItem>(`/restaurants/${restaurantId}/menu-items`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const restaurant = db.restaurants.find((item) => item.id === restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return db.menuItems.filter((item) => item.restaurant_id === restaurantId);
    }, false);
  }

  return requestJson<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
}

export async function createCart(payload: CartCreatePayload): Promise<Cart> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const restaurant = db.restaurants.find((item) => item.id === payload.restaurant_id);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const cart: Cart = {
        id: newId(),
        restaurant_id: payload.restaurant_id,
        items: [],
        total: '0.00',
        created_at: new Date().toISOString(),
      };
      db.carts.push(cart);
      return cart;
    });
  }

  return requestJson<Cart>('/carts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCart(cartId: string): Promise<Cart> {
  if (isMockModeEnabled()) {
    return withMock((db) => getCartOrThrow(db, cartId), false);
  }

  return requestJson<Cart>(`/carts/${cartId}`);
}

export async function addCartItem(cartId: string, payload: CartItemCreatePayload): Promise<Cart> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const cart = getCartOrThrow(db, cartId);
      const menuItem = db.menuItems.find((item) => item.id === payload.menu_item_id);
      if (!menuItem || menuItem.restaurant_id !== cart.restaurant_id) {
        throw new Error('Menu item not found for this cart');
      }

      const existing = cart.items.find((item) => item.menu_item_id === payload.menu_item_id);
      if (existing) {
        existing.quantity += payload.quantity;
        existing.subtotal = toMoney(toNumber(existing.unit_price) * existing.quantity);
      } else {
        cart.items.push({
          menu_item_id: menuItem.id,
          name: menuItem.name,
          unit_price: menuItem.price,
          quantity: payload.quantity,
          subtotal: toMoney(toNumber(menuItem.price) * payload.quantity),
        });
      }

      cart.total = computeCartTotal(cart.items);
      return cart;
    });
  }

  return requestJson<Cart>(`/carts/${cartId}/items`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeCartItem(cartId: string, menuItemId: string): Promise<Cart> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const cart = getCartOrThrow(db, cartId);
      const nextItems = cart.items.filter((item) => item.menu_item_id !== menuItemId);
      if (nextItems.length === cart.items.length) {
        throw new Error('Item not found in cart');
      }

      cart.items = nextItems;
      cart.total = computeCartTotal(cart.items);
      return cart;
    });
  }

  return requestJson<Cart>(`/carts/${cartId}/items/${menuItemId}`, {
    method: 'DELETE',
  });
}

export async function createOrderFromCart(cartId: string, payload: OrderCreatePayload): Promise<Order> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const cart = getCartOrThrow(db, cartId);
      if (!cart.items.length) {
        throw new Error('Cart is empty');
      }

      const now = new Date().toISOString();
      const order: Order = {
        id: newId(),
        restaurant_id: cart.restaurant_id,
        cart_id: cart.id,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        items: clone(cart.items),
        status: 'recebido',
        total: cart.total,
        webhook_urls: payload.webhook_url ? [payload.webhook_url] : [],
        events: [
          {
            id: newId(),
            order_id: '',
            status: 'recebido',
            note: 'Pedido criado',
            created_at: now,
          },
        ],
        created_at: now,
        updated_at: now,
      };
      order.events[0].order_id = order.id;

      db.orders.push(order);
      return order;
    });
  }

  return requestJson<Order>(`/orders/from-cart/${cartId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrder(orderId: string): Promise<Order> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const order = getOrderOrThrow(db, orderId);
      maybeAutoProgressOrder(order);
      return order;
    });
  }

  return requestJson<Order>(`/orders/${orderId}`);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const order = getOrderOrThrow(db, orderId);
      const allowed: Record<OrderStatus, OrderStatus[]> = {
        recebido: ['a_caminho'],
        a_caminho: ['entregue'],
        entregue: [],
      };

      if (order.status !== status && !allowed[order.status].includes(status)) {
        throw new Error('Invalid order status transition');
      }

      if (order.status !== status) {
        const now = new Date().toISOString();
        order.status = status;
        order.updated_at = now;
        order.events.push({
          id: newId(),
          order_id: order.id,
          status,
          note: `Status atualizado para ${status}`,
          created_at: now,
        });
      }

      return order;
    });
  }

  return requestJson<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function addWebhook(orderId: string, webhookUrl: string): Promise<Order> {
  if (isMockModeEnabled()) {
    return withMock((db) => {
      const order = getOrderOrThrow(db, orderId);
      if (!order.webhook_urls.includes(webhookUrl)) {
        order.webhook_urls.push(webhookUrl);
      }
      return order;
    });
  }

  return requestJson<Order>(`/orders/${orderId}/webhooks`, {
    method: 'POST',
    body: JSON.stringify({ webhook_url: webhookUrl }),
  });
}
