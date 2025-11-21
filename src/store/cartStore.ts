import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as cartService from "../services/cart.service";
import type { BudgetInfo } from "../services/cart.service";

export interface CartItem {
  cartItemId: number; // 백엔드에서 제공하는 ID
  foodId: number;
  foodName: string;
  price?: number; // 단가 (선택적)
  averagePrice?: number; // 백엔드가 averagePrice로 제공
  quantity: number;
  imageUrl?: string;
  totalPrice?: number; // 총 가격 (선택적)
  subtotal?: number; // 백엔드가 subtotal로 제공
  options?: Array<{
    optionName: string;
    optionValue: string;
    additionalPrice?: number;
  }>;
}

interface CartStore {
  items: CartItem[];
  storeId: number | null;
  storeName: string | null;
  budgetInfo: BudgetInfo | null;
  isLoading: boolean;
  error: string | null;

  // 장바구니 조회 및 동기화
  fetchCart: () => Promise<void>;

  // 상품 추가 (409 에러 처리 포함)
  addItem: (
    storeId: number,
    foodId: number,
    foodName: string,
    price: number,
    quantity: number,
    imageUrl?: string,
    replaceCart?: boolean
  ) => Promise<{ success: boolean; conflict?: any }>;

  // 수량 변경
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;

  // 상품 삭제
  removeItem: (cartItemId: number) => Promise<void>;

  // 장바구니 비우기
  clearCart: () => Promise<void>;

  // 체크아웃
  checkout: (
    mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "OTHER",
    discount?: number,
    expendedDate?: string,
    expendedTime?: string
  ) => Promise<cartService.CheckoutResponse>;

  // 로컬 유틸리티
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,
      storeName: null,
      budgetInfo: null,
      isLoading: false,
      error: null,

      // 장바구니 조회
      fetchCart: async () => {
        console.log("===== fetchCart 시작 =====");
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.getCart();
          console.log("===== fetchCart API 응답 =====", cart);
          console.log("- items 개수:", cart.items?.length || 0);
          console.log("- storeId:", cart.storeId);
          console.log("- storeName:", cart.storeName);
          console.log("- totalAmount:", cart.totalAmount);
          console.log("- budgetInfo:", cart.budgetInfo);

          // budgetInfo 로깅 강화
          if (cart.budgetInfo) {
            console.log("===== budgetInfo 상세 =====");
            console.log("- currentMealType:", cart.budgetInfo.currentMealType);
            console.log("- mealBudget:", cart.budgetInfo.mealBudget);
            console.log(
              "- dailyBudgetBefore:",
              cart.budgetInfo.dailyBudgetBefore
            );
            console.log(
              "- dailyBudgetAfter:",
              cart.budgetInfo.dailyBudgetAfter
            );
            console.log(
              "- monthlyBudgetBefore:",
              cart.budgetInfo.monthlyBudgetBefore
            );
            console.log(
              "- monthlyBudgetAfter:",
              cart.budgetInfo.monthlyBudgetAfter
            );
            console.log("- isOverBudget:", cart.budgetInfo.isOverBudget);
          } else {
            console.warn("[CartStore] budgetInfo가 응답에 없습니다.");
          }

          set({
            items: cart.items || [],
            storeId: cart.storeId || null,
            storeName: cart.storeName || null,
            budgetInfo: cart.budgetInfo || null,
            isLoading: false,
          });
          console.log("===== fetchCart 완료, store 업데이트됨 =====");
        } catch (error: any) {
          console.error("===== fetchCart 실패 =====", error);
          // fetchCart 실패 시 빈 장바구니로 초기화
          set({
            items: [],
            storeId: null,
            storeName: null,
            budgetInfo: null,
            error: error.message || "장바구니 조회 실패",
            isLoading: false,
          });
        }
      },

      // 상품 추가
      addItem: async (
        storeId,
        foodId,
        _foodName, // 백엔드에서 제공하므로 미사용
        _price, // 백엔드에서 제공하므로 미사용
        quantity,
        _imageUrl, // 백엔드에서 제공하므로 미사용
        replaceCart = false
      ) => {
        console.log("===== addItem 시작 =====");
        console.log("- storeId:", storeId);
        console.log("- foodId:", foodId);
        console.log("- quantity:", quantity);
        console.log("- replaceCart:", replaceCart);

        set({ isLoading: true, error: null });
        try {
          const response = await cartService.addToCart({
            storeId,
            foodId,
            quantity,
            replaceCart,
          });
          console.log("===== addItem API 성공 =====", response);

          // 성공 시 장바구니 재조회
          console.log("===== 장바구니 재조회 시작 =====");
          await get().fetchCart();
          console.log("===== 장바구니 재조회 완료 =====");

          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          console.log("===== addItem 실패 =====");
          console.log("- error.response?.status:", error.response?.status);
          console.log("- error.response?.data:", error.response?.data);

          set({ isLoading: false });

          // 409 Conflict 에러 (다른 가게 상품)
          if (error.response?.status === 409) {
            console.log("===== 409 Conflict 처리 =====");
            const errorData = error.response?.data;
            console.log("- errorData:", JSON.stringify(errorData, null, 2));

            // 백엔드 에러 응답 구조: { result: 'ERROR', data: null, error: { code, message, data } }
            const conflictInfo = errorData?.error?.data;
            const errorMessage =
              errorData?.error?.message ||
              "다른 가게의 상품이 장바구니에 있습니다.";

            console.log("- conflictInfo:", conflictInfo);
            console.log("- errorMessage:", errorMessage);

            // conflictInfo가 없으면 에러 메시지에서 정보 추출
            if (!conflictInfo) {
              console.log("===== conflictInfo 없음, 기본값 반환 =====");
              return {
                success: false,
                conflict: {
                  currentStoreId: null,
                  currentStoreName: "현재 장바구니",
                  requestedStoreId: storeId,
                  requestedStoreName: "새로운 가게",
                  message: errorMessage,
                },
              };
            }

            console.log("===== conflict 정보 반환 =====");
            return {
              success: false,
              conflict: {
                ...conflictInfo,
                message: conflictInfo.message || errorMessage,
              },
            };
          }

          // 기타 에러
          console.log("===== 기타 에러 =====");
          set({ error: error.message || "장바구니 추가 실패" });
          return { success: false };
        }
      },

      // 수량 변경
      updateQuantity: async (cartItemId, quantity) => {
        console.log("[CartStore] updateQuantity 호출:", {
          cartItemId,
          quantity,
        });
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.updateCartItemQuantity(
            cartItemId,
            quantity
          );
          console.log("[CartStore] updateQuantity 성공:", response);
          console.log("[CartStore] 장바구니 재조회 시작");
          await get().fetchCart();
          set({ isLoading: false });
        } catch (error: any) {
          console.error("[CartStore] updateQuantity 실패:", {
            error,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          const errorMessage =
            error.response?.data?.error?.message ||
            error.message ||
            "수량 변경 실패";
          set({ error: errorMessage, isLoading: false });
          throw error; // 에러를 다시 throw하여 UI에서 처리할 수 있도록
        }
      },

      // 상품 삭제
      removeItem: async (cartItemId) => {
        console.log("[CartStore] removeItem 호출:", { cartItemId });
        set({ isLoading: true, error: null });
        try {
          await cartService.removeCartItem(cartItemId);
          console.log("[CartStore] removeItem 성공, 장바구니 재조회");
          await get().fetchCart();
          set({ isLoading: false });
        } catch (error: any) {
          console.error("[CartStore] removeItem 실패:", error);
          set({ error: error.message || "상품 삭제 실패", isLoading: false });
        }
      },

      // 장바구니 비우기
      clearCart: async () => {
        console.log("[CartStore] clearCart 호출");
        set({ isLoading: true, error: null });
        try {
          await cartService.clearCart();
          console.log("[CartStore] clearCart 성공");
          set({
            items: [],
            storeId: null,
            storeName: null,
            budgetInfo: null,
            isLoading: false,
          });
        } catch (error: any) {
          console.error("[CartStore] clearCart 실패:", error);
          set({
            error: error.message || "장바구니 비우기 실패",
            isLoading: false,
          });
        }
      },

      // 체크아웃
      checkout: async (mealType, discount = 0, expendedDate, expendedTime) => {
        console.log("[CartStore] checkout 호출:", {
          mealType,
          discount,
          expendedDate,
          expendedTime,
        });

        const { storeId } = get();

        if (!storeId) {
          throw new Error("장바구니에 상품이 없습니다.");
        }

        set({ isLoading: true, error: null });
        try {
          // 기본값: 현재 날짜/시간
          const now = new Date();

          // YYYY-MM-DD 형식
          const dateStr =
            expendedDate ||
            `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(now.getDate()).padStart(2, "0")}`;

          // HH:mm:ss 형식
          const timeStr =
            expendedTime ||
            `${String(now.getHours()).padStart(2, "0")}:${String(
              now.getMinutes()
            ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

          console.log("[CartStore] checkout 파라미터:", {
            storeId,
            mealType,
            discount,
            dateStr,
            timeStr,
          });

          const response = await cartService.checkout({
            storeId,
            mealType,
            discount,
            expendedDate: dateStr,
            expendedTime: timeStr,
          });

          console.log("[CartStore] checkout 성공:", {
            expenditureId: response.expenditureId,
            finalAmount: response.finalAmount,
            storeName: response.storeName,
          });

          // 체크아웃 성공 시 장바구니 자동으로 비워짐
          set({
            items: [],
            storeId: null,
            storeName: null,
            budgetInfo: null,
            isLoading: false,
          });

          return response;
        } catch (error: any) {
          console.error("[CartStore] checkout 실패:", error);
          set({ error: error.message || "체크아웃 실패", isLoading: false });
          throw error;
        }
      },

      // 로컬 유틸리티
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const itemTotal = item.totalPrice || item.subtotal || 0;
          return total + itemTotal;
        }, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
