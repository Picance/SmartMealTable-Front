import api from "./api";
import type { ApiResponse, Category, Food } from "../types/api";

export const categoryService = {
  // 카테고리 목록 조회
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get("/api/v1/categories");
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
