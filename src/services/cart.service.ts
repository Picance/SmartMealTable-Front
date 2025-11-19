import api from "./api";
import { ApiResponse } from "../types/api";

// ===== Types =====

export interface FoodOption {
  optionName: string;
  optionValue: string;
  additionalPrice?: number;
}

export interface CartItem {
  cartItemId: number;
  foodId: number;
  foodName: string;
  price: number;
  quantity: number;
  options: FoodOption[];
  totalPrice: number;
  imageUrl?: string;
}

export interface BudgetInfo {
  currentMealType: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
  mealBudget: number;
  dailyBudgetBefore: number;
  dailyBudgetAfter: number;
  monthlyBudgetBefore: number;
  monthlyBudgetAfter: number;
  isOverBudget: boolean;
}

export interface Cart {
  cartId: number | null;
  storeId?: number;
  storeName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  budgetInfo?: BudgetInfo;
}

export interface AddToCartRequest {
  storeId: number;
  foodId: number;
  quantity: number;
  replaceCart?: boolean;
  options?: FoodOption[];
}

export interface AddToCartResponse {
  cartItemId: number;
  foodId: number;
  foodName: string;
  quantity: number;
  totalPrice: number;
  cartTotalAmount: number;
  replacedCart: boolean;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemResponse {
  cartItemId: number;
  quantity: number;
  totalPrice: number;
  cartTotalAmount: number;
}

export interface CheckoutRequest {
  storeId: number; // 필수
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER" | "SNACK";
  discount?: number;
  expendedDate: string; // YYYY-MM-DD
  expendedTime: string; // HH:mm:ss
  memo?: string; // 선택적
}

export interface ExpenditureItem {
  foodName: string;
  quantity: number;
  price: number;
}

export interface BudgetSummary {
  mealBudgetBefore: number;
  mealBudgetAfter: number;
  dailyBudgetBefore: number;
  dailyBudgetAfter: number;
  monthlyBudgetBefore: number;
  monthlyBudgetAfter: number;
}

export interface CheckoutResponse {
  expenditureId: number;
  storeName: string;
  items: ExpenditureItem[];
  subtotal: number;
  discount: number;
  finalAmount: number;
  mealType: string;
  expendedDate: string;
  expendedTime: string;
  budgetSummary: BudgetSummary;
  createdAt: string;
}

export interface CartConflictError {
  code: string;
  message: string;
  data: {
    currentStoreId: number;
    currentStoreName: string;
    requestedStoreId: number;
    requestedStoreName: string;
    suggestion: string;
  };
}

// ===== API Functions =====

/**
 * 장바구니 조회
 * GET /api/v1/cart
 */
export const getCart = async (): Promise<Cart> => {
  console.log("===== Cart API: getCart 호출 =====");
  try {
    const response = await api.get<ApiResponse<any>>("/api/v1/cart");
    console.log("===== Cart API: getCart 응답 =====");
    console.log("- response.data:", JSON.stringify(response.data, null, 2));

    if (response.data.result === "SUCCESS" && response.data.data) {
      // 백엔드가 data를 배열로 반환하는 경우 처리
      const cartData = Array.isArray(response.data.data)
        ? response.data.data[0] // 배열의 첫 번째 요소
        : response.data.data; // 객체 그대로

      console.log("===== Cart API: getCart 성공 =====");
      console.log("- cartData:", JSON.stringify(cartData, null, 2));

      if (cartData) {
        // 백엔드 응답 필드명을 우리 인터페이스에 맞게 매핑
        const mappedItems = (cartData.items || []).map((item: any) => ({
          cartItemId: item.cartItemId,
          foodId: item.foodId,
          foodName: item.foodName,
          imageUrl: item.imageUrl,
          price: item.averagePrice, // averagePrice를 price로 매핑
          averagePrice: item.averagePrice,
          quantity: item.quantity,
          totalPrice: item.subtotal, // subtotal을 totalPrice로 매핑
          subtotal: item.subtotal,
          options: item.options || [],
        }));

        return {
          cartId: cartData.cartId,
          storeId: cartData.storeId,
          storeName: cartData.storeName,
          items: mappedItems,
          subtotal: cartData.totalAmount || 0,
          discount: 0,
          totalAmount: cartData.totalAmount || 0,
          budgetInfo: cartData.budgetInfo,
        };
      }
    }

    console.log("===== Cart API: getCart 빈 장바구니 반환 =====");
    // 빈 장바구니
    return {
      cartId: null,
      items: [],
      subtotal: 0,
      discount: 0,
      totalAmount: 0,
    };
  } catch (error) {
    console.error("===== Cart API: getCart 에러 =====", error);
    throw error;
  }
};

/**
 * 장바구니에 상품 추가
 * POST /api/v1/cart/items
 *
 * @throws {CartConflictError} 다른 가게의 상품이 있을 때 (409 Conflict)
 */
export const addToCart = async (
  request: AddToCartRequest
): Promise<AddToCartResponse> => {
  console.log("===== Cart API: addToCart 호출 =====");
  console.log("- request:", JSON.stringify(request, null, 2));

  try {
    const response = await api.post<ApiResponse<AddToCartResponse>>(
      "/api/v1/cart/items",
      request
    );
    console.log("===== Cart API: addToCart 성공 =====");
    console.log("- response.data:", JSON.stringify(response.data, null, 2));

    if (response.data.result === "SUCCESS" && response.data.data) {
      return response.data.data;
    }

    throw new Error("장바구니 추가 실패");
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log("===== Cart API: addToCart 409 Conflict =====");
      console.log(
        "- error.response.data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("===== Cart API: addToCart 에러 =====", error);
    }
    throw error; // 에러를 다시 던져서 cartStore에서 처리하도록
  }
};

/**
 * 장바구니 상품 수량 변경
 * PUT /api/v1/cart/items/{cartItemId}
 */
export const updateCartItemQuantity = async (
  cartItemId: number,
  quantity: number
): Promise<UpdateCartItemResponse> => {
  console.log(
    `🔄 [Cart API] 수량 변경 요청: cartItemId=${cartItemId}, quantity=${quantity}`
  );
  console.log(`🔄 [Cart API] URL: /api/v1/cart/items/${cartItemId}`);
  console.log(`🔄 [Cart API] Body:`, { quantity });

  try {
    const response = await api.put<ApiResponse<UpdateCartItemResponse>>(
      `/api/v1/cart/items/${cartItemId}`,
      { quantity }
    );
    console.log("🔄 [Cart API] HTTP Status:", response.status);
    console.log(
      "🔄 [Cart API] 수량 변경 응답 (전체):",
      JSON.stringify(response.data, null, 2)
    );
    console.log("🔄 [Cart API] response.data.result:", response.data.result);
    console.log("🔄 [Cart API] response.data.data:", response.data.data);

    // 204 No Content 처리
    if (response.status === 204) {
      console.log("🔄 [Cart API] 204 No Content - 성공으로 처리");
      return {
        cartItemId,
        quantity,
        totalPrice: 0,
        cartTotalAmount: 0,
      };
    }

    if (response.data.result === "SUCCESS") {
      // data가 있으면 반환, 없으면 기본값 반환
      if (response.data.data) {
        return response.data.data;
      }

      // data가 없지만 SUCCESS인 경우 fallback
      console.log("🔄 [Cart API] data가 없지만 SUCCESS - 빈 응답 처리");
      return {
        cartItemId,
        quantity,
        totalPrice: 0,
        cartTotalAmount: 0,
      };
    }

    console.error("🔄 [Cart API] result가 SUCCESS가 아님:", response.data);
    throw new Error("수량 변경 실패");
  } catch (error: any) {
    console.error("🔄 [Cart API] 수량 변경 에러:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `/api/v1/cart/items/${cartItemId}`,
    });
    throw error;
  }
};

/**
 * 장바구니 상품 삭제
 * DELETE /api/v1/cart/items/{cartItemId}
 */
export const removeCartItem = async (cartItemId: number): Promise<void> => {
  console.log(`🗑️ [Cart API] 상품 삭제 요청: cartItemId=${cartItemId}`);
  await api.delete(`/api/v1/cart/items/${cartItemId}`);
  console.log("🗑️ [Cart API] 상품 삭제 완료");
};

/**
 * 특정 가게의 모든 상품 삭제
 * DELETE /api/v1/cart/store/{storeId}
 */
export const removeCartItemsByStore = async (
  storeId: number
): Promise<void> => {
  console.log(`🗑️ [Cart API] 가게별 상품 삭제 요청: storeId=${storeId}`);
  await api.delete(`/api/v1/cart/store/${storeId}`);
  console.log("🗑️ [Cart API] 가게별 상품 삭제 완료");
};

/**
 * 장바구니 전체 비우기
 * DELETE /api/v1/cart
 */
export const clearCart = async (): Promise<void> => {
  console.log("🧹 [Cart API] 장바구니 전체 비우기 요청");
  await api.delete("/api/v1/cart");
  console.log("🧹 [Cart API] 장바구니 전체 비우기 완료");
};

/**
 * 장바구니 → 지출 등록 (체크아웃)
 * POST /api/v1/cart/checkout
 */
export const checkout = async (
  request: CheckoutRequest
): Promise<CheckoutResponse> => {
  console.log("💳 [Cart API] 체크아웃 요청:", request);
  const response = await api.post<ApiResponse<CheckoutResponse>>(
    "/api/v1/cart/checkout",
    request
  );
  console.log("💳 [Cart API] 체크아웃 응답:", response.data);

  if (response.data.result === "SUCCESS" && response.data.data) {
    return response.data.data;
  }

  throw new Error("체크아웃 실패");
};
