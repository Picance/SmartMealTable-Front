import api from "./api";
import type { ApiResponse } from "../types/api";

export interface RecommendedMenu {
  menuId: number;
  menuName: string;
  price: number;
  imageUrl: string;
  storeId: number;
  storeName: string;
  distance: number;
  recommendationReason: string;
  matchScore: number;
}

export const recommendationService = {
  // 개인화 메뉴 추천
  async getPersonalizedMenus(params?: {
    mealType?: "BREAKFAST" | "LUNCH" | "DINNER";
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    limit?: number;
  }): Promise<ApiResponse<RecommendedMenu[]>> {
    const response = await api.get("/api/v1/recommendations/menus", { params });
    return response.data;
  },

  // 예산 기반 추천
  async getBudgetFriendlyMenus(params?: {
    mealType?: "BREAKFAST" | "LUNCH" | "DINNER";
    latitude?: number;
    longitude?: number;
  }): Promise<ApiResponse<RecommendedMenu[]>> {
    const response = await api.get("/api/v1/recommendations/budget-friendly", {
      params,
    });
    return response.data;
  },

  // 취향 기반 추천
  async getTasteBasedMenus(params?: {
    latitude?: number;
    longitude?: number;
    limit?: number;
  }): Promise<ApiResponse<RecommendedMenu[]>> {
    const response = await api.get("/api/v1/recommendations/taste-based", {
      params,
    });
    return response.data;
  },

  // 새로운 메뉴 추천 (모험가형)
  async getNewMenus(params?: {
    latitude?: number;
    longitude?: number;
    limit?: number;
  }): Promise<ApiResponse<RecommendedMenu[]>> {
    const response = await api.get("/api/v1/recommendations/new", { params });
    return response.data;
  },
};
