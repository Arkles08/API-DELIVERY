export type OrderStatus = 'recebido' | 'a_caminho' | 'entregue';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: string;
}

export interface CartItem {
  menu_item_id: string;
  name: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: string;
  restaurant_id: string;
  items: CartItem[];
  total: string;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string;
  created_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  cart_id: string;
  customer_name: string;
  customer_phone: string;
  items: CartItem[];
  status: OrderStatus;
  total: string;
  webhook_urls: string[];
  events: OrderEvent[];
  created_at: string;
  updated_at: string;
}

export interface RestaurantCreatePayload {
  name: string;
  description: string;
}

export interface MenuItemCreatePayload {
  name: string;
  description: string;
  price: string;
}

export interface CartCreatePayload {
  restaurant_id: string;
}

export interface CartItemCreatePayload {
  menu_item_id: string;
  quantity: number;
}

export interface OrderCreatePayload {
  customer_name: string;
  customer_phone: string;
  webhook_url?: string;
}
