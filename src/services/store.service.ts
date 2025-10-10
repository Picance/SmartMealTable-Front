import api from "./api";
import type { ApiResponse, Store, StoreDetail, Menu } from "../types/api";

export interface StoreSearchParams {
  latitude?: number;
  longitude?: number;
  categoryId?: number;
  maxDistance?: number;
  maxPrice?: number;
  sortBy?: "DISTANCE" | "PRICE" | "RATING" | "POPULARITY";
  page?: number;
  size?: number;
}

export interface RecommendedStore extends Store {
  recommendationReason: string;
  matchScore: number;
}

export const storeService = {
  // 근처 가게 검색
  async searchStores(params: StoreSearchParams): Promise<
    ApiResponse<{
      content: Store[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
    }>
  > {
    const response = await api.get("/stores/search", { params });
    return response.data;
  },

  // 가게 상세 조회
  async getStoreDetail(storeId: number): Promise<ApiResponse<StoreDetail>> {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },

  // 가게 메뉴 조회
  async getStoreMenus(storeId: number): Promise<ApiResponse<Menu[]>> {
    const response = await api.get(`/stores/${storeId}/menus`);
    return response.data;
  },

  // 추천 가게 조회
  async getRecommendedStores(params?: {
    latitude?: number;
    longitude?: number;
    mealType?: "BREAKFAST" | "LUNCH" | "DINNER";
  }): Promise<ApiResponse<RecommendedStore[]>> {
    const response = await api.get("/stores/recommended", { params });
    return response.data;
  },

  // 인기 가게 조회
  async getPopularStores(params?: {
    latitude?: number;
    longitude?: number;
    limit?: number;
  }): Promise<ApiResponse<Store[]>> {
    const response = await api.get("/stores/popular", { params });
    return response.data;
  },

  // 가게 즐겨찾기 추가
  async addFavorite(storeId: number): Promise<ApiResponse<void>> {
    const response = await api.post(`/stores/${storeId}/favorite`);
    return response.data;
  },

  // 가게 즐겨찾기 해제
  async removeFavorite(storeId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/stores/${storeId}/favorite`);
    return response.data;
  },

  // 즐겨찾는 가게 목록
  async getFavoriteStores(): Promise<ApiResponse<Store[]>> {
    const response = await api.get("/stores/favorites");
    return response.data;
  },
};
