import api from "./api";
import type { ApiResponse } from "../types/api";

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
  // 예산 현황 조회
  async getBudgetStatus(): Promise<ApiResponse<BudgetStatus>> {
    const response = await api.get("/api/v1/budgets/status");
    return response.data;
  },

  // 일별 예산 조회 (특정 날짜)
  async getDailyBudget(date: string): Promise<
    ApiResponse<{
      date: string;
      totalBudget: number;
      totalSpent: number;
      remainingBudget: number;
      mealBudgets: Array<{
        mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
        budget: number;
        spent: number;
        remaining: number;
      }>;
    }>
  > {
    const response = await api.get("/api/v1/budgets/daily", {
      params: { date },
    });
    return response.data;
  },

  // 월간 예산 조회
  async getMonthlyBudget(
    year: number,
    month: number
  ): Promise<ApiResponse<BudgetStatus>> {
    const response = await api.get("/api/v1/budgets/monthly", {
      params: { year, month },
    });
    return response.data;
  },

  // 예산 수정
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
