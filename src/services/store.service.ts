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
    const response = await api.get("/api/v1/stores/search", { params });
    return response.data;
  },

  // 가게 상세 조회
  async getStoreDetail(storeId: number): Promise<ApiResponse<StoreDetail>> {
    const response = await api.get(`/api/v1/stores/${storeId}`);
    return response.data;
  },

  // 가게 메뉴 조회 (API 명세: /api/v1/stores/{storeId}/foods)
  async getStoreMenus(
    storeId: number,
    sort?: string
  ): Promise<
    ApiResponse<{
      storeId: number;
      storeName: string;
      foods: Menu[];
    }>
  > {
    const params = sort ? { sort } : {};
    const response = await api.get(`/api/v1/stores/${storeId}/foods`, {
      params,
    });
    return response.data;
  },

  // 추천 가게 조회
  async getRecommendedStores(params?: {
    latitude?: number;
    longitude?: number;
    mealType?: "BREAKFAST" | "LUNCH" | "DINNER";
  }): Promise<ApiResponse<RecommendedStore[]>> {
    const response = await api.get("/api/v1/stores/recommended", { params });
    return response.data;
  },

  // 인기 가게 조회
  async getPopularStores(params?: {
    latitude?: number;
    longitude?: number;
    limit?: number;
  }): Promise<ApiResponse<Store[]>> {
    const response = await api.get("/api/v1/stores/popular", { params });
    return response.data;
  },

  // 가게 즐겨찾기 추가
  async addFavorite(storeId: number): Promise<
    ApiResponse<{
      favoriteId: number;
      storeId: number;
      storeName: string;
      displayOrder: number;
      createdAt: string;
    }>
  > {
    const response = await api.post("/api/v1/favorites", { storeId });
    return response.data;
  },

  // 가게 즐겨찾기 해제 (storeId 기반)
  async removeFavoriteByStoreId(storeId: number): Promise<ApiResponse<void>> {
    // 먼저 즐겨찾기 목록에서 해당 storeId의 favoriteId를 찾아야 함
    const favoritesResponse = await this.getFavoriteStores();
    if (favoritesResponse.result === "SUCCESS" && favoritesResponse.data) {
      const favorite = favoritesResponse.data.favorites?.find(
        (f: any) => f.storeId === storeId
      );
      if (favorite) {
        const response = await api.delete(
          `/api/v1/favorites/${favorite.favoriteId}`
        );
        return response.data;
      }
    }
    throw new Error("Favorite not found");
  },

  // 가게 즐겨찾기 해제 (favoriteId 기반 - 기존 메서드 유지)
  async removeFavorite(favoriteId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/api/v1/favorites/${favoriteId}`);
    return response.data;
  },

  // 즐겨찾는 가게 목록
  async getFavoriteStores(): Promise<
    ApiResponse<{
      favorites: Array<{
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
        imageUrl: string;
        createdAt: string;
      }>;
      totalCount: number;
      openCount: number;
      page: number;
      size: number;
      totalPages: number;
    }>
  > {
    const response = await api.get("/api/v1/favorites");
    return response.data;
  },
};
