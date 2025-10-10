import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  foodId: number;
  foodName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  storeId: number;
  storeName: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (foodId: number) => void;
  updateQuantity: (foodId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.foodId === item.foodId
          );

          if (existingItem) {
            // 이미 장바구니에 있으면 수량 증가
            return {
              items: state.items.map((i) =>
                i.foodId === item.foodId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          } else {
            // 새 아이템 추가
            return {
              items: [...state.items, { ...item, quantity: 1 }],
            };
          }
        });
      },

      removeItem: (foodId) => {
        set((state) => ({
          items: state.items.filter((item) => item.foodId !== foodId),
        }));
      },

      updateQuantity: (foodId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(foodId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.foodId === foodId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
