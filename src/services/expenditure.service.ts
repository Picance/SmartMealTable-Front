import api from "./api";
import type {
  ApiResponse,
  Expenditure,
  CreateExpenditureRequest,
} from "../types/api";

export const expenditureService = {
  // 지출 등록 (장바구니에서)
  async createFromCart(
    data: CreateExpenditureRequest
  ): Promise<ApiResponse<Expenditure>> {
    const response = await api.post<ApiResponse<Expenditure>>(
      "/expenditures",
      data
    );
    return response.data;
  },

  // 지출 등록 (수동 입력)
  async createManual(
    data: CreateExpenditureRequest
  ): Promise<ApiResponse<Expenditure>> {
    const response = await api.post<ApiResponse<Expenditure>>(
      "/expenditures/manual",
      data
    );
    return response.data;
  },

  // SMS 파싱하여 지출 등록
  async createFromSMS(data: {
    smsContent: string;
  }): Promise<ApiResponse<Expenditure>> {
    const response = await api.post<ApiResponse<Expenditure>>(
      "/expenditures/sms",
      data
    );
    return response.data;
  },

  // 지출 목록 조회
  async getExpenditures(params?: {
    startDate?: string;
    endDate?: string;
    mealType?: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
    minAmount?: number;
    maxAmount?: number;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<Expenditure[]>> {
    const response = await api.get<ApiResponse<Expenditure[]>>(
      "/expenditures",
      { params }
    );
    return response.data;
  },

  // 지출 상세 조회
  async getExpenditureDetail(
    expenditureId: number
  ): Promise<ApiResponse<Expenditure>> {
    const response = await api.get<ApiResponse<Expenditure>>(
      `/expenditures/${expenditureId}`
    );
    return response.data;
  },

  // 지출 수정
  async updateExpenditure(
    expenditureId: number,
    data: Partial<CreateExpenditureRequest>
  ): Promise<ApiResponse<Expenditure>> {
    const response = await api.put<ApiResponse<Expenditure>>(
      `/expenditures/${expenditureId}`,
      data
    );
    return response.data;
  },

  // 지출 삭제
  async deleteExpenditure(expenditureId: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `/expenditures/${expenditureId}`
    );
    return response.data;
  },

  // 월별 지출 통계
  async getMonthlyStats(
    year: number,
    month: number
  ): Promise<
    ApiResponse<{
      totalSpent: number;
      dailyAverage: number;
      mealBreakdown: {
        BREAKFAST: number;
        LUNCH: number;
        DINNER: number;
        SNACK: number;
      };
      topStores: Array<{
        storeId: number;
        storeName: string;
        amount: number;
        count: number;
      }>;
      dailySpending: Array<{ date: string; amount: number }>;
    }>
  > {
    const response = await api.get(`/expenditures/stats/monthly`, {
      params: { year, month },
    });
    return response.data;
  },

  // 일별 지출 통계
  async getDailyStats(date: string): Promise<
    ApiResponse<{
      totalSpent: number;
      mealBreakdown: {
        BREAKFAST: number;
        LUNCH: number;
        DINNER: number;
        SNACK: number;
      };
      expenditures: Expenditure[];
    }>
  > {
    const response = await api.get(`/expenditures/stats/daily`, {
      params: { date },
    });
    return response.data;
  },
};
