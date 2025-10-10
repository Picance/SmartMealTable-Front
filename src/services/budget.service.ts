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

export const budgetService = {
  // 예산 현황 조회
  async getBudgetStatus(): Promise<ApiResponse<BudgetStatus>> {
    const response = await api.get("/budget/status");
    return response.data;
  },

  // 월간 예산 조회
  async getMonthlyBudget(
    year: number,
    month: number
  ): Promise<ApiResponse<BudgetStatus>> {
    const response = await api.get("/budget/monthly", {
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
    const response = await api.put("/budget", data);
    return response.data;
  },
};
