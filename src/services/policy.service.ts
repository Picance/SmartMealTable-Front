import { api } from "./api";
import type { PolicyListResponse, PolicyDetailResponse } from "../types/api";

/**
 * 약관 목록 조회
 * @returns 약관 목록 (content 제외)
 */
export const getPolicies = async (): Promise<PolicyListResponse> => {
  const response = await api.get<PolicyListResponse>("/api/v1/policies");
  if (response.data.result === "SUCCESS" && response.data.data) {
    return response.data.data;
  }
  throw new Error("약관 목록을 가져오는데 실패했습니다.");
};

/**
 * 약관 상세 조회
 * @param policyId - 약관 ID
 * @returns 약관 상세 정보 (content 포함)
 */
export const getPolicyDetail = async (
  policyId: number
): Promise<PolicyDetailResponse> => {
  const response = await api.get<PolicyDetailResponse>(
    `/api/v1/policies/${policyId}`
  );
  if (response.data.result === "SUCCESS" && response.data.data) {
    return response.data.data;
  }
  throw new Error("약관 상세 정보를 가져오는데 실패했습니다.");
};
