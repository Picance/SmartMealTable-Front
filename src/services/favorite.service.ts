import api from "./api";
import { ApiResponse } from "../types/api";

// ===== Types =====

export interface Favorite {
  favoriteId: number;
  storeId: number;
  storeName: string;
  categoryId: number;
  categoryName: string;
  address: string;
  distance: number;
  averagePrice: number;
  reviewCount: number;
  displayOrder: number;
  isOpenNow: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface FavoritesListResponse {
  favorites: Favorite[];
  totalCount: number;
  openCount: number;
  size: number;
  hasNext: boolean;
  nextCursor: number | null;
}

export interface AddFavoriteRequest {
  storeId: number;
}

export interface AddFavoriteResponse {
  favoriteId: number;
  storeId: number;
  storeName: string;
  displayOrder: number;
  createdAt: string;
}

export interface UpdateFavoriteOrderRequest {
  favoriteOrders: Array<{
    favoriteId: number;
    displayOrder: number;
  }>;
}

export interface UpdateFavoriteOrderResponse {
  message: string;
  updatedCount: number;
}

export type SortBy = "priority" | "name" | "reviewCount" | "distance" | "createdAt";

export interface GetFavoritesParams {
  sortBy?: SortBy;
  isOpenOnly?: boolean;
  categoryId?: number;
  cursor?: number;
  size?: number;
}

// ===== API Functions =====

/**
 * 즐겨찾기 목록 조회
 * GET /api/v1/favorites
 */
export const getFavorites = async (
  params?: GetFavoritesParams
): Promise<ApiResponse<FavoritesListResponse>> => {
  console.log("⭐ [Favorite API] 즐겨찾기 목록 조회:", params);
  const response = await api.get<ApiResponse<FavoritesListResponse>>(
    "/api/v1/favorites",
    { params }
  );
  console.log("⭐ [Favorite API] 즐겨찾기 목록 응답:", response.data);
  return response.data;
};

/**
 * 즐겨찾기 추가
 * POST /api/v1/favorites
 */
export const addFavorite = async (
  storeId: number
): Promise<ApiResponse<AddFavoriteResponse>> => {
  console.log("⭐ [Favorite API] 즐겨찾기 추가:", storeId);
  const response = await api.post<ApiResponse<AddFavoriteResponse>>(
    "/api/v1/favorites",
    { storeId }
  );
  console.log("⭐ [Favorite API] 즐겨찾기 추가 응답:", response.data);
  return response.data;
};

/**
 * 즐겨찾기 삭제
 * DELETE /api/v1/favorites/{favoriteId}
 */
export const deleteFavorite = async (favoriteId: number): Promise<void> => {
  console.log("⭐ [Favorite API] 즐겨찾기 삭제:", favoriteId);
  await api.delete(`/api/v1/favorites/${favoriteId}`);
  console.log("⭐ [Favorite API] 즐겨찾기 삭제 완료");
};

/**
 * 즐겨찾기 순서 변경
 * PUT /api/v1/favorites/order
 */
export const updateFavoriteOrder = async (
  request: UpdateFavoriteOrderRequest
): Promise<ApiResponse<UpdateFavoriteOrderResponse>> => {
  console.log("⭐ [Favorite API] 즐겨찾기 순서 변경:", request);
  const response = await api.put<ApiResponse<UpdateFavoriteOrderResponse>>(
    "/api/v1/favorites/order",
    request
  );
  console.log("⭐ [Favorite API] 즐겨찾기 순서 변경 응답:", response.data);
  return response.data;
};

export const favoriteService = {
  getFavorites,
  addFavorite,
  deleteFavorite,
  updateFavoriteOrder,
};
