import api from "./api";
import type {
  ApiResponse,
  GroupListResponse,
  OnboardingProfileRequest,
  OnboardingProfileResponse,
  AddressRequest,
  BudgetRequest,
  PreferenceRequest,
  FoodPreferenceRequest,
  FoodPreferenceResponse,
  PolicyAgreementRequest,
  Food,
  PageResponse,
} from "../types/api";

export const onboardingService = {
  // 프로필 설정
  async saveProfile(
    data: OnboardingProfileRequest
  ): Promise<ApiResponse<OnboardingProfileResponse>> {
    const response = await api.post<ApiResponse<OnboardingProfileResponse>>(
      "/api/v1/onboarding/profile",
      data
    );
    return response.data;
  },

  // 그룹 검색
  async searchGroups(
    keyword?: string,
    type?: "UNIVERSITY" | "COMPANY" | "OTHER",
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<GroupListResponse>> {
    const params: any = { page, size };

    if (keyword) {
      params.name = keyword; // API는 'name' 파라미터로 검색
    }

    if (type) {
      params.type = type;
    }

    const response = await api.get<ApiResponse<GroupListResponse>>(
      "/api/v1/groups",
      { params }
    );
    return response.data;
  },

  // 주소 설정
  async saveAddress(data: AddressRequest): Promise<ApiResponse<void>> {
    const response = await api.post("/api/v1/onboarding/address", data);
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
    const response = await api.get("/api/v1/maps/search-address", {
      params: { query },
    });
    return response.data;
  },

  // 예산 설정
  async saveBudget(data: BudgetRequest): Promise<ApiResponse<void>> {
    const response = await api.post("/api/v1/onboarding/budget", data);
    return response.data;
  },

  // 선호 카테고리 설정
  async savePreferences(data: PreferenceRequest): Promise<ApiResponse<void>> {
    const response = await api.post("/api/v1/onboarding/preferences", data);
    return response.data;
  },

  // 개별 음식 선호도 저장/덮어쓰기 (Idempotent)
  async saveFoodPreferences(
    data: FoodPreferenceRequest
  ): Promise<ApiResponse<FoodPreferenceResponse>> {
    const response = await api.put<ApiResponse<FoodPreferenceResponse>>(
      "/api/v1/onboarding/food-preferences",
      data
    );
    return response.data;
  },

  // 온보딩용 음식 목록 조회
  async getFoods(
    categoryId?: number,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<Food>>> {
    const params: any = { page, size };
    if (categoryId) {
      params.categoryId = categoryId;
    }
    const response = await api.get<ApiResponse<PageResponse<Food>>>(
      "/api/v1/onboarding/foods",
      { params }
    );
    return response.data;
  },

  // 약관 동의
  async savePolicyAgreements(data: PolicyAgreementRequest): Promise<
    ApiResponse<{
      agreedCount: number;
      memberAuthenticationId: number;
      message: string;
    }>
  > {
    const response = await api.post(
      "/api/v1/onboarding/policy-agreements",
      data
    );
    return response.data;
  },

  // 온보딩 완료 여부 확인
  async checkOnboardingStatus(): Promise<
    ApiResponse<{
      isCompleted: boolean;
      currentStep: string | null;
    }>
  > {
    const response = await api.get("/api/v1/onboarding/status");
    return response.data;
  },
};
