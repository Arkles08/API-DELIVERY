import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addCartItem, addMenuItem, addWebhook, createCart, createOrderFromCart, createRestaurant, getCart, getOrder, listMenuItems, listRestaurants, removeCartItem, updateOrderStatus } from '../services/delivery.service';
import type { CartCreatePayload, CartItemCreatePayload, MenuItemCreatePayload, OrderCreatePayload, OrderStatus, RestaurantCreatePayload } from '../types/delivery.types';
import { useDeliveryStore } from '../../../stores/delivery.store';

export function useDeliveryDashboard() {
  const queryClient = useQueryClient();
  const seedRequestedRef = useRef(false);
  const selectedRestaurantId = useDeliveryStore((state) => state.selectedRestaurantId);
  const activeCartId = useDeliveryStore((state) => state.activeCartId);
  const activeOrderId = useDeliveryStore((state) => state.activeOrderId);
  const demoSeeded = useDeliveryStore((state) => state.demoSeeded);
  const setSelectedRestaurantId = useDeliveryStore((state) => state.setSelectedRestaurantId);
  const setActiveCartId = useDeliveryStore((state) => state.setActiveCartId);
  const setActiveOrderId = useDeliveryStore((state) => state.setActiveOrderId);
  const markDemoSeeded = useDeliveryStore((state) => state.markDemoSeeded);

  const restaurantsQuery = useQuery({
    queryKey: ['restaurants'],
    queryFn: listRestaurants,
  });

  const selectedRestaurant = useMemo(
    () => restaurantsQuery.data?.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null,
    [restaurantsQuery.data, selectedRestaurantId],
  );

  const menuQuery = useQuery({
    queryKey: ['menu', selectedRestaurant?.id],
    queryFn: () => listMenuItems(selectedRestaurant?.id ?? ''),
    enabled: Boolean(selectedRestaurant?.id),
  });

  const cartQuery = useQuery({
    queryKey: ['cart', activeCartId],
    queryFn: () => getCart(activeCartId ?? ''),
    enabled: Boolean(activeCartId),
  });

  const orderQuery = useQuery({
    queryKey: ['order', activeOrderId],
    queryFn: () => getOrder(activeOrderId ?? ''),
    enabled: Boolean(activeOrderId),
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      return currentStatus === 'entregue' ? false : 15000;
    },
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (payload: RestaurantCreatePayload) => createRestaurant(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: ({ restaurantId, payload }: { restaurantId: string; payload: MenuItemCreatePayload }) =>
      addMenuItem(restaurantId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menu', selectedRestaurantId] });
      await queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  const createCartMutation = useMutation({
    mutationFn: (payload: CartCreatePayload) => createCart(payload),
    onSuccess: async (cart) => {
      setActiveCartId(cart.id);
      setActiveOrderId(null);
      await queryClient.invalidateQueries({ queryKey: ['cart', cart.id] });
    },
  });

  const addCartItemMutation = useMutation({
    mutationFn: ({ cartId, payload }: { cartId: string; payload: CartItemCreatePayload }) =>
      addCartItem(cartId, payload),
    onSuccess: async () => {
      if (activeCartId) {
        await queryClient.invalidateQueries({ queryKey: ['cart', activeCartId] });
      }
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: ({ cartId, menuItemId }: { cartId: string; menuItemId: string }) =>
      removeCartItem(cartId, menuItemId),
    onSuccess: async () => {
      if (activeCartId) {
        await queryClient.invalidateQueries({ queryKey: ['cart', activeCartId] });
      }
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: ({ cartId, payload }: { cartId: string; payload: OrderCreatePayload }) =>
      createOrderFromCart(cartId, payload),
    onSuccess: async (order) => {
      setActiveOrderId(order.id);
      await queryClient.invalidateQueries({ queryKey: ['order', order.id] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ['order', order.id] });
    },
  });

  const addWebhookMutation = useMutation({
    mutationFn: ({ orderId, webhookUrl }: { orderId: string; webhookUrl: string }) =>
      addWebhook(orderId, webhookUrl),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ['order', order.id] });
    },
  });

  async function selectRestaurantAndOpenCart(restaurantId: string) {
    setSelectedRestaurantId(restaurantId);
    const cart = await createCartMutation.mutateAsync({ restaurant_id: restaurantId });
    setActiveCartId(cart.id);
  }

  async function seedDemoRestaurant() {
    if (seedRequestedRef.current || demoSeeded || restaurantsQuery.data?.length) {
      return;
    }

    seedRequestedRef.current = true;
    try {
      const restaurant = await createRestaurantMutation.mutateAsync({
        name: 'Cantina Aurora',
        description: 'Massas artesanais, pizzas de longa fermentação e delivery noturno.',
      });

      const firstItem = await createMenuItemMutation.mutateAsync({
        restaurantId: restaurant.id,
        payload: {
          name: 'Pizza Margherita',
          description: 'Molho de tomate, muçarela, parmesão e manjericão fresco.',
          price: '42.90',
        },
      });

      const secondItem = await createMenuItemMutation.mutateAsync({
        restaurantId: restaurant.id,
        payload: {
          name: 'Lasanha da Casa',
          description: 'Massa fresca, ragù bovino e molho bechamel.',
          price: '49.50',
        },
      });

      const cart = await createCartMutation.mutateAsync({ restaurant_id: restaurant.id });
      await addCartItemMutation.mutateAsync({
        cartId: cart.id,
        payload: { menu_item_id: firstItem.id, quantity: 1 },
      });
      await addCartItemMutation.mutateAsync({
        cartId: cart.id,
        payload: { menu_item_id: secondItem.id, quantity: 1 },
      });

      setSelectedRestaurantId(restaurant.id);
      setActiveCartId(cart.id);
      markDemoSeeded();
    } catch (error) {
      seedRequestedRef.current = false;
      throw error;
    }
  }

  useEffect(() => {
    if (restaurantsQuery.isSuccess && (restaurantsQuery.data?.length ?? 0) === 0 && !demoSeeded && !seedRequestedRef.current) {
      void seedDemoRestaurant().catch(() => {
        seedRequestedRef.current = false;
      });
    }
  }, [demoSeeded, restaurantsQuery.data?.length, restaurantsQuery.isSuccess]);

  useEffect(() => {
    if (!restaurantsQuery.isSuccess || !selectedRestaurantId) {
      return;
    }

    const hasSelectedRestaurant = (restaurantsQuery.data ?? []).some((restaurant) => restaurant.id === selectedRestaurantId);
    if (!hasSelectedRestaurant) {
      setSelectedRestaurantId(null);
      queryClient.removeQueries({ queryKey: ['menu', selectedRestaurantId] });
    }
  }, [queryClient, restaurantsQuery.data, restaurantsQuery.isSuccess, selectedRestaurantId, setSelectedRestaurantId]);

  return {
    restaurants: restaurantsQuery.data ?? [],
    selectedRestaurant,
    menuItems: menuQuery.data ?? [],
    cart: cartQuery.data ?? null,
    order: orderQuery.data ?? null,
    selectedRestaurantId,
    activeCartId,
    activeOrderId,
    isLoading: restaurantsQuery.isLoading,
    isSeeding: createRestaurantMutation.isPending,
    isPending:
      createRestaurantMutation.isPending ||
      createMenuItemMutation.isPending ||
      createCartMutation.isPending ||
      addCartItemMutation.isPending ||
      removeCartItemMutation.isPending ||
      createOrderMutation.isPending ||
      updateStatusMutation.isPending ||
      addWebhookMutation.isPending,
    errorMessage:
      restaurantsQuery.error?.message ??
      menuQuery.error?.message ??
      cartQuery.error?.message ??
      orderQuery.error?.message ??
      createRestaurantMutation.error?.message ??
      createMenuItemMutation.error?.message ??
      createCartMutation.error?.message ??
      addCartItemMutation.error?.message ??
      removeCartItemMutation.error?.message ??
      createOrderMutation.error?.message ??
      updateStatusMutation.error?.message ??
      addWebhookMutation.error?.message ??
      null,
    async createRestaurant(payload: RestaurantCreatePayload) {
      const restaurant = await createRestaurantMutation.mutateAsync(payload);
      await selectRestaurantAndOpenCart(restaurant.id);
    },
    async createMenuItem(payload: MenuItemCreatePayload) {
      if (!selectedRestaurantId) {
        return;
      }
      return await createMenuItemMutation.mutateAsync({ restaurantId: selectedRestaurantId, payload });
    },
    async selectRestaurant(restaurantId: string) {
      await selectRestaurantAndOpenCart(restaurantId);
    },
    async addItemToCart(menuItemId: string, quantity: number) {
      if (!activeCartId) {
        throw new Error('Abra um carrinho antes de adicionar itens.');
      }
      await addCartItemMutation.mutateAsync({
        cartId: activeCartId,
        payload: { menu_item_id: menuItemId, quantity },
      });
    },
    async placeOrder(payload: OrderCreatePayload) {
      if (!activeCartId) {
        throw new Error('Carrinho indisponível.');
      }
      await createOrderMutation.mutateAsync({ cartId: activeCartId, payload });
    },
    async removeItemFromCart(menuItemId: string) {
      if (!activeCartId) {
        throw new Error('Carrinho indisponível.');
      }
      await removeCartItemMutation.mutateAsync({ cartId: activeCartId, menuItemId });
    },
    async changeOrderStatus(status: OrderStatus) {
      if (!activeOrderId) {
        return;
      }
      await updateStatusMutation.mutateAsync({ orderId: activeOrderId, status });
    },
    async attachWebhook(webhookUrl: string) {
      if (!activeOrderId) {
        return;
      }
      await addWebhookMutation.mutateAsync({ orderId: activeOrderId, webhookUrl });
    },
    async seedDemo() {
      await seedDemoRestaurant();
    },
  };
}
