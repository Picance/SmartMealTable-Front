import api from "./api";
import type { ApiResponse } from "../types/api";

// 추천 점수 상세 정보
export interface RecommendationScores {
  stability: number;
  exploration: number;
  budgetEfficiency: number;
  accessibility: number;
}

// 추천 가게 정보
export interface RecommendedStore {
  storeId: number;
  name: string; // API 명세에서는 name
  storeName?: string; // 하위 호환성
  categoryId?: number;
  categoryName?: string;
  address?: string;
  latitude: number;
  longitude: number;
  distance: number;
  averagePrice: number;
  reviewCount: number;
  recommendationScore?: number; // API 명세에 있음
  score?: number; // 하위 호환성
  scores?: RecommendationScores; // 세부 점수
  isFavorite: boolean;
  favoriteId?: number;
  isOpen?: boolean;
  imageUrl: string;
  cursorId?: number;
}

// 추천 목록 응답
export interface RecommendationResponse {
  data: RecommendedStore[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  lastId?: number;
}

// 추천 요청 파라미터
export interface RecommendationParams {
  latitude: number;
  longitude: number;
  keyword?: string;
  radius?: number; // 0.1 ~ 10 km
  sortBy?: "SCORE" | "DISTANCE" | "reviewCount" | "distance";
  includeDisliked?: boolean;
  openNow?: boolean;
  storeType?: "ALL" | "CAMPUS_RESTAURANT" | "RESTAURANT";
  // 커서 기반 페이징
  lastId?: number;
  limit?: number;
  // 오프셋 기반 페이징
  page?: number;
  size?: number;
}

// 추천 점수 상세 조회 응답
export interface DetailedScores {
  storeId: number;
  storeName: string;
  recommendationScore: number;
  stabilityScore: {
    total: number;
    details: {
      preferenceScore: number;
      pastExpenditureScore: number;
      reviewTrustScore: number;
    };
  };
  explorationScore: {
    total: number;
    details: {
      categoryFreshnessScore: number;
      storeNewnessScore: number;
      recentInterestScore: number;
    };
  };
  budgetEfficiencyScore: {
    total: number;
    details: {
      valueForMoneyScore: number;
      budgetFitScore: number;
    };
  };
  accessibilityScore: {
    total: number;
    details: {
      distance: number;
      distanceScore: number;
    };
  };
}

// 추천 유형 변경 요청
export interface UpdateRecommendationTypeRequest {
  recommendationType: "SAVER" | "ADVENTURER" | "BALANCED";
}

// 추천 유형 변경 응답
export interface UpdateRecommendationTypeResponse {
  recommendationType: "SAVER" | "ADVENTURER" | "BALANCED";
  weights: {
    stability: number;
    exploration: number;
    budgetEfficiency: number;
    accessibility: number;
  };
  updatedAt: string;
}

// 자동완성 아이템
export interface AutocompleteItem {
  type: "STORE" | "FOOD" | "CATEGORY";
  id: number;
  name: string;
  categoryName?: string;
  storeId?: number;
  storeName?: string;
  imageUrl?: string;
}

// 자동완성 응답
export interface AutocompleteResponse {
  suggestions: AutocompleteItem[];
  storeShortcuts?: Array<{
    storeId: number;
    storeName: string;
    categoryName: string;
  }>;
}

export const recommendationService = {
  // 개인화 추천 (기본)
  async getRecommendations(
    params: RecommendationParams
  ): Promise<ApiResponse<RecommendedStore[]>> {
    const response = await api.get("/api/v1/recommendations", { params });
    return response.data;
  },

  // 추천 점수 상세 조회
  async getStoreScores(storeId: number): Promise<ApiResponse<DetailedScores>> {
    const response = await api.get(`/api/v1/recommendations/${storeId}/scores`);
    return response.data;
  },

  // 추천 유형 변경
  async updateRecommendationType(
    data: UpdateRecommendationTypeRequest
  ): Promise<ApiResponse<UpdateRecommendationTypeResponse>> {
    const response = await api.put(
      "/api/v1/members/me/recommendation-type",
      data
    );
    return response.data;
  },

  // 통합 자동완성 검색
  async getAutocomplete(params: {
    keyword: string;
    limit?: number;
    storeShortcutsLimit?: number;
  }): Promise<ApiResponse<AutocompleteResponse>> {
    const response = await api.get("/api/v1/autocomplete", { params });
    return response.data;
  },
};
