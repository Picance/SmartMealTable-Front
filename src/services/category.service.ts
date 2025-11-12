import api from "./api";
import type { ApiResponse, Category, Food } from "../types/api";

export interface CategoryListResponse {
  categories: Category[];
}

export interface CategoryPreferenceRequest {
  preferences: Array<{
    categoryId: number;
    weight: 100 | 0 | -100;
  }>;
}

export interface CategoryPreferenceResponse {
  updatedCount: number;
  updatedAt: string;
}

export const categoryService = {
  // 카테고리 목록 조회
  async getCategories(): Promise<ApiResponse<CategoryListResponse>> {
    const response = await api.get("/api/v1/categories");
    return response.data;
  },

  // 카테고리 선호도 수정
  async updateCategoryPreferences(
    request: CategoryPreferenceRequest
  ): Promise<ApiResponse<CategoryPreferenceResponse>> {
    const response = await api.put(
      "/api/v1/members/me/preferences/categories",
      request
    );
    return response.data;
  },

  // 음식 목록 조회 (카테고리별)
  async getFoodsByCategory(categoryId: number): Promise<ApiResponse<Food[]>> {
    const response = await api.get(`/api/v1/categories/${categoryId}/foods`);
    return response.data;
  },

  // 전체 음식 목록 조회 (온보딩용)
  async getAllFoods(): Promise<ApiResponse<Food[]>> {
    const response = await api.get("/api/v1/foods");
    return response.data;
  },
};
