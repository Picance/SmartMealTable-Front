import api from "./api";
import type {
  ApiResponse,
  Group,
  OnboardingProfileRequest,
  AddressRequest,
  BudgetRequest,
  PreferenceRequest,
  FoodPreferenceRequest,
  PolicyAgreementRequest,
} from "../types/api";

export const onboardingService = {
  // 프로필 설정
  async saveProfile(
    data: OnboardingProfileRequest
  ): Promise<ApiResponse<void>> {
    const response = await api.post("/onboarding/profile", data);
    return response.data;
  },

  // 그룹 검색
  async searchGroups(
    keyword: string,
    page: number = 0,
    size: number = 20
  ): Promise<
    ApiResponse<{
      content: Group[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    }>
  > {
    const response = await api.get("/groups", {
      params: { keyword, page, size },
    });
    return response.data;
  },

  // 주소 설정
  async saveAddress(data: AddressRequest): Promise<ApiResponse<void>> {
    const response = await api.post("/onboarding/address", data);
    return response.data;
  },

  // 주소 검색 (Naver Maps API)
  async searchAddress(query: string): Promise<
    ApiResponse<{
      addresses: Array<{
        roadAddress: string;
        jibunAddress: string;
        x: string; // longitude
        y: string; // latitude
      }>;
    }>
  > {
    const response = await api.get("/maps/search-address", {
      params: { query },
    });
    return response.data;
  },

  // 예산 설정
  async saveBudget(data: BudgetRequest): Promise<ApiResponse<void>> {
    const response = await api.post("/onboarding/budget", data);
    return response.data;
  },

  // 선호 카테고리 설정
  async savePreferences(data: PreferenceRequest): Promise<ApiResponse<void>> {
    const response = await api.post("/onboarding/preferences", data);
    return response.data;
  },

  // 개별 음식 선호도 설정
  async saveFoodPreferences(
    data: FoodPreferenceRequest
  ): Promise<ApiResponse<void>> {
    const response = await api.post("/onboarding/food-preferences", data);
    return response.data;
  },

  // 약관 동의
  async savePolicyAgreements(
    data: PolicyAgreementRequest
  ): Promise<ApiResponse<void>> {
    const response = await api.post("/onboarding/policy-agreements", data);
    return response.data;
  },

  // 온보딩 완료 여부 확인
  async checkOnboardingStatus(): Promise<
    ApiResponse<{
      isCompleted: boolean;
      currentStep: string | null;
    }>
  > {
    const response = await api.get("/onboarding/status");
    return response.data;
  },
};
