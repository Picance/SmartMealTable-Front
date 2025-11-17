import api from "./api";
import type {
  ApiResponse,
  HomeDashboardResponse,
  OnboardingStatusResponse,
  MonthlyBudgetConfirmRequest,
  MonthlyBudgetConfirmResponse,
} from "../types/api";

/**
 * 홈 대시보드 조회
 * GET /api/v1/home/dashboard
 */
export const getHomeDashboard = async (): Promise<
  ApiResponse<HomeDashboardResponse>
> => {
  const response = await api.get<ApiResponse<HomeDashboardResponse>>(
    "/api/v1/home/dashboard"
  );
  return response.data;
};

/**
 * 온보딩 상태 조회
 * GET /api/v1/members/me/onboarding-status
 */
export const getOnboardingStatus = async (): Promise<
  ApiResponse<OnboardingStatusResponse>
> => {
  const response = await api.get<ApiResponse<OnboardingStatusResponse>>(
    "/api/v1/members/me/onboarding-status"
  );
  return response.data;
};

/**
 * 월별 예산 확인 처리
 * POST /api/v1/members/me/monthly-budget-confirmed
 */
export const confirmMonthlyBudget = async (
  request: MonthlyBudgetConfirmRequest
): Promise<ApiResponse<MonthlyBudgetConfirmResponse>> => {
  const response = await api.post<ApiResponse<MonthlyBudgetConfirmResponse>>(
    "/api/v1/members/me/monthly-budget-confirmed",
    request
  );
  return response.data;
};
