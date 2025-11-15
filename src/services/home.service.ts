import { api } from "./api";
import type {
  HomeDashboardResponse,
  OnboardingStatusResponse,
  MonthlyBudgetConfirmRequest,
  MonthlyBudgetConfirmResponse,
} from "../types/api";

/**
 * 홈 대시보드 조회
 * GET /api/v1/home/dashboard
 */
export const getHomeDashboard = async () => {
  const response = await api.get<HomeDashboardResponse>(
    "/api/v1/home/dashboard"
  );
  return response.data;
};

/**
 * 온보딩 상태 조회
 * GET /api/v1/members/me/onboarding-status
 */
export const getOnboardingStatus = async () => {
  const response = await api.get<OnboardingStatusResponse>(
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
) => {
  const response = await api.post<MonthlyBudgetConfirmResponse>(
    "/api/v1/members/me/monthly-budget-confirmed",
    request
  );
  return response.data;
};
