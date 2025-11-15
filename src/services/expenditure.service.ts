import { api } from "./api";
import type {
  ParseSmsRequest,
  ParseSmsResponse,
  CreateExpenditureRequest,
  CreateExpenditureFromCartRequest,
  ExpenditureDetail,
  ExpenditureListResponse,
  DailyStatisticsResponse,
} from "../types/api";

/**
 * SMS 파싱
 * POST /api/v1/expenditures/parse-sms
 */
export const parseSms = async (request: ParseSmsRequest) => {
  const response = await api.post<ParseSmsResponse>(
    "/api/v1/expenditures/parse-sms",
    request
  );
  return response.data;
};

/**
 * 지출 내역 등록 (수동 입력)
 * POST /api/v1/expenditures
 */
export const createExpenditure = async (request: CreateExpenditureRequest) => {
  const response = await api.post<ExpenditureDetail>(
    "/api/v1/expenditures",
    request
  );
  return response.data;
};

/**
 * 장바구니 → 지출 내역 등록
 * POST /api/v1/expenditures/from-cart
 */
export const createExpenditureFromCart = async (
  request: CreateExpenditureFromCartRequest
) => {
  const response = await api.post<ExpenditureDetail>(
    "/api/v1/expenditures/from-cart",
    request
  );
  return response.data;
};

/**
 * 지출 내역 조회 (목록)
 * GET /api/v1/expenditures
 */
export const getExpenditures = async (params: {
  startDate: string;
  endDate: string;
  mealType?: "BREAKFAST" | "LUNCH" | "DINNER";
  categoryId?: number;
  page?: number;
  size?: number;
}) => {
  const response = await api.get<ExpenditureListResponse>(
    "/api/v1/expenditures",
    { params }
  );
  return response.data;
};

/**
 * 지출 내역 상세 조회
 * GET /api/v1/expenditures/{expenditureId}
 */
export const getExpenditureDetail = async (expenditureId: number) => {
  const response = await api.get<ExpenditureDetail>(
    `/api/v1/expenditures/${expenditureId}`
  );
  return response.data;
};

/**
 * 지출 내역 수정
 * PUT /api/v1/expenditures/{expenditureId}
 */
export const updateExpenditure = async (
  expenditureId: number,
  request: CreateExpenditureRequest
) => {
  const response = await api.put<ExpenditureDetail>(
    `/api/v1/expenditures/${expenditureId}`,
    request
  );
  return response.data;
};

/**
 * 지출 내역 삭제
 * DELETE /api/v1/expenditures/{expenditureId}
 */
export const deleteExpenditure = async (expenditureId: number) => {
  const response = await api.delete<void>(
    `/api/v1/expenditures/${expenditureId}`
  );
  return response.data;
};

/**
 * 일별 지출 통계 조회
 * GET /api/v1/expenditures/statistics
 */
export const getDailyStatistics = async (params: {
  startDate: string;
  endDate: string;
}) => {
  const response = await api.get<DailyStatisticsResponse>(
    "/api/v1/expenditures/statistics",
    { params }
  );
  return response.data;
};
