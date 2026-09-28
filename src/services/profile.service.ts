import apiClient from "./api";

// 추천 유형 (백엔드 RecommendationType enum과 동일)
export type RecommendationType = "SAVER" | "ADVENTURER" | "BALANCED";

// 프로필 타입 정의
export interface ProfileResponse {
  result: string;
  data: {
    memberId: number;
    nickname: string;
    email: string;
    name: string;
    recommendationType: RecommendationType;
    group: {
      groupId: number;
      name: string;
      type: string;
    };
    socialAccounts: Array<{
      provider: string;
      connectedAt: string;
    }>;
    passwordExpiresAt: string;
    createdAt: string;
  };
  error: null;
}

export interface UpdateNicknameResponse {
  result: string;
  data: {
    memberId: number;
    nickname: string;
    group: {
      groupId: number;
      name: string;
      type: string;
    };
    updatedAt: string;
  };
  error: null;
}

export interface UpdateProfileResponse {
  result: string;
  data: {
    memberId: number;
    nickname: string;
    group: {
      groupId: number;
      name: string;
      type: string;
    };
    updatedAt: string;
  };
  error: null;
}

// 내 프로필 조회
export const getMyProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>("/api/v1/members/me");
  return response.data;
};

// 닉네임 수정
export const updateNickname = async (
  nickname: string
): Promise<UpdateNicknameResponse> => {
  const response = await apiClient.put<UpdateNicknameResponse>(
    "/api/v1/members/me/nickname",
    { nickname }
  );
  return response.data;
};

// 프로필 수정 (그룹 변경)
export const updateProfile = async (
  groupId: number
): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>(
    "/api/v1/members/me",
    { groupId }
  );
  return response.data;
};

// 추천 유형 변경
export const updateRecommendationType = async (
  recommendationType: RecommendationType
) => {
  const response = await apiClient.put("/api/v1/recommendations/type", {
    recommendationType,
  });
  return response.data;
};

// 비밀번호 변경
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await apiClient.put("/api/v1/members/me/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};
