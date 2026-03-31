import { create } from 'zustand';

interface DeliveryStore {
  selectedRestaurantId: string | null;
  activeCartId: string | null;
  activeOrderId: string | null;
  demoSeeded: boolean;
  setSelectedRestaurantId: (restaurantId: string | null) => void;
  setActiveCartId: (cartId: string | null) => void;
  setActiveOrderId: (orderId: string | null) => void;
  markDemoSeeded: () => void;
}

export const useDeliveryStore = create<DeliveryStore>((set) => ({
  selectedRestaurantId: null,
  activeCartId: null,
  activeOrderId: null,
  demoSeeded: false,
  setSelectedRestaurantId: (restaurantId) => set({ selectedRestaurantId: restaurantId }),
  setActiveCartId: (cartId) => set({ activeCartId: cartId }),
  setActiveOrderId: (orderId) => set({ activeOrderId: orderId }),
  markDemoSeeded: () => set({ demoSeeded: true }),
}));
