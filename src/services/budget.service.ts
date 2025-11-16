import api from "./api";
import type {
  ApiResponse,
  MonthlyBudgetResponse,
  DailyBudgetResponse,
  UpdateMonthlyBudgetRequest,
  UpdateMonthlyBudgetResponse,
  UpdateDailyBudgetRequest,
  UpdateDailyBudgetResponse,
  CreateMonthlyBudgetRequest,
  CreateMonthlyBudgetResponse,
  BulkCreateDailyBudgetRequest,
  BulkCreateDailyBudgetResponse,
} from "../types/api";

export interface BudgetStatus {
  monthlyBudget: number;
  monthlySpent: number;
  monthlyRemaining: number;
  dailyBudget: number;
  dailySpent: number;
  dailyRemaining: number;
  mealBudgets: {
    BREAKFAST: {
      budget: number;
      spent: number;
      remaining: number;
    };
    LUNCH: {
      budget: number;
      spent: number;
      remaining: number;
    };
    DINNER: {
      budget: number;
      spent: number;
      remaining: number;
    };
  };
}

// 온보딩 예산 설정 요청
export interface OnboardingBudgetRequest {
  monthlyBudget: number;
  dailyBudget: number;
  mealBudgets: {
    BREAKFAST: number;
    LUNCH: number;
    DINNER: number;
  };
}

// 온보딩 예산 설정 응답
export interface OnboardingBudgetResponse {
  monthlyBudget: number;
  dailyBudget: number;
  mealBudgets: Array<{
    mealType: "BREAKFAST" | "LUNCH" | "DINNER";
    budget: number;
  }>;
}

export const budgetService = {
  // 월간 예산 조회
  async getMonthlyBudget(
    year: number,
    month: number
  ): Promise<ApiResponse<MonthlyBudgetResponse>> {
    const response = await api.get("/api/v1/budgets/monthly", {
      params: { year, month },
    });
    return response.data;
  },

  // 일별 예산 조회 (특정 날짜)
  // 404는 데이터 없음으로 정상 처리
  async getDailyBudget(
    date: string
  ): Promise<ApiResponse<DailyBudgetResponse | null>> {
    try {
      const response = await api.get("/api/v1/budgets/daily", {
        params: { date },
      });
      return response.data;
    } catch (error: any) {
      // 404는 데이터가 없는 정상 케이스
      if (error.response?.status === 404) {
        return {
          result: "SUCCESS",
          data: null,
          error: null,
        };
      }
      throw error;
    }
  },

  // 월별 예산 수정
  async updateMonthlyBudget(
    data: UpdateMonthlyBudgetRequest
  ): Promise<ApiResponse<UpdateMonthlyBudgetResponse>> {
    const response = await api.put("/api/v1/budgets", data);
    return response.data;
  },

  // 일별 예산 수정
  async updateDailyBudget(
    date: string,
    data: UpdateDailyBudgetRequest
  ): Promise<ApiResponse<UpdateDailyBudgetResponse>> {
    const response = await api.put(`/api/v1/budgets/daily/${date}`, data);
    return response.data;
  },

  // 월별 예산 생성
  async createMonthlyBudget(
    data: CreateMonthlyBudgetRequest
  ): Promise<ApiResponse<CreateMonthlyBudgetResponse>> {
    const response = await api.post("/api/v1/budgets/monthly", data);
    return response.data;
  },

  // 일별 예산 일괄 생성
  async bulkCreateDailyBudget(
    data: BulkCreateDailyBudgetRequest
  ): Promise<ApiResponse<BulkCreateDailyBudgetResponse>> {
    const response = await api.post("/api/v1/budgets/daily/bulk", data);
    return response.data;
  },

  // 예산 현황 조회
  async getBudgetStatus(): Promise<ApiResponse<BudgetStatus>> {
    const response = await api.get("/api/v1/budgets/status");
    return response.data;
  },

  // 예산 수정 (기존 메서드 - 호환성 유지)
  async updateBudget(data: {
    monthlyBudget: number;
    dailyBudget: number;
    mealBudgets: {
      BREAKFAST: number;
      LUNCH: number;
      DINNER: number;
    };
  }): Promise<ApiResponse<void>> {
    const response = await api.put("/api/v1/budgets", data);
    return response.data;
  },

  // 온보딩 예산 설정
  async createOnboardingBudget(
    data: OnboardingBudgetRequest
  ): Promise<ApiResponse<OnboardingBudgetResponse>> {
    const response = await api.post("/api/v1/onboarding/budget", data);
    return response.data;
  },
};
