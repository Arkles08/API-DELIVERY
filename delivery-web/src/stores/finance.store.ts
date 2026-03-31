import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DailyFinance = {
  totalRevenue: number;
  totalPayments: number;
};

interface FinanceStore {
  dailyByDate: Record<string, DailyFinance>;
  registerClientPayment: (amount: number, paidAt?: Date) => void;
  getDailyRevenue: (targetDate?: Date) => number;
  getDailyPaymentsCount: (targetDate?: Date) => number;
}

function toDateKey(targetDate: Date): string {
  return targetDate.toISOString().slice(0, 10);
}

export const useFinanceStore = create<FinanceStore>(
  persist<FinanceStore>(
    (set, get) => ({
      dailyByDate: {},
      registerClientPayment: (amount: number, paidAt = new Date()) => {
        if (!Number.isFinite(amount) || amount <= 0) {
          return;
        }

        const dateKey = toDateKey(paidAt);
        set((state) => {
          const currentDay = state.dailyByDate[dateKey] ?? { totalRevenue: 0, totalPayments: 0 };
          return {
            dailyByDate: {
              ...state.dailyByDate,
              [dateKey]: {
                totalRevenue: Math.round((currentDay.totalRevenue + amount) * 100) / 100,
                totalPayments: currentDay.totalPayments + 1,
              },
            },
          };
        });
      },
      getDailyRevenue: (targetDate = new Date()) => {
        const dateKey = toDateKey(targetDate);
        return get().dailyByDate[dateKey]?.totalRevenue ?? 0;
      },
      getDailyPaymentsCount: (targetDate = new Date()) => {
        const dateKey = toDateKey(targetDate);
        return get().dailyByDate[dateKey]?.totalPayments ?? 0;
      },
    }),
    {
      name: 'delivery-finance-store',
      partialize: (state: FinanceStore) => ({ dailyByDate: state.dailyByDate }),
    },
  ),
);
