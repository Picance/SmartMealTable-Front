import { api } from "./api";

// 주소 유형
export type AddressType = "HOME" | "WORK" | "SCHOOL" | "ETC";

// 주소 정보 타입
export interface Address {
  addressHistoryId: number;
  addressAlias: string;
  addressType: AddressType;
  lotNumberAddress: string;
  streetNameAddress: string;
  detailedAddress: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  registeredAt: string;
}

// 주소 등록 요청 타입
export interface CreateAddressRequest {
  addressAlias: string;
  addressType: AddressType;
  streetNameAddress: string;
  lotNumberAddress: string;
  detailedAddress?: string;
  latitude: number;
  longitude: number;
}

// 주소 수정 요청 타입
export interface UpdateAddressRequest {
  addressAlias: string;
  addressType: AddressType;
  streetNameAddress: string;
  lotNumberAddress: string;
  detailedAddress?: string;
  latitude: number;
  longitude: number;
}

export const addressService = {
  // 주소 목록 조회
  getAddresses: async () => {
    try {
      const response = await api.get<Address[]>("/api/v1/members/me/addresses");
      console.log("주소 목록 조회 API 응답:", response.data);

      // API 응답 구조에 따라 데이터 반환
      if (response.data.data) {
        return response.data.data;
      }

      // data가 없으면 빈 배열 반환
      return [];
    } catch (error: any) {
      console.error("주소 목록 조회 실패:", error);
      console.error("에러 응답:", error.response?.data);

      // 404 에러면 빈 배열 반환 (주소가 없는 경우)
      if (error.response?.status === 404) {
        return [];
      }

      throw error;
    }
  },

  // 주소 추가
  createAddress: async (data: CreateAddressRequest) => {
    try {
      console.log("주소 추가 API 요청:", data);
      const response = await api.post<Address>(
        "/api/v1/members/me/addresses",
        data
      );
      console.log("주소 추가 API 응답:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("주소 등록 실패:", error);
      console.error("에러 응답:", error.response?.data);
      throw error;
    }
  },

  // 주소 수정
  updateAddress: async (addressId: number, data: UpdateAddressRequest) => {
    try {
      console.log("주소 수정 API 요청:", addressId, data);
      const response = await api.put<Address>(
        `/api/v1/members/me/addresses/${addressId}`,
        data
      );
      console.log("주소 수정 API 응답:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("주소 수정 실패:", error);
      console.error("에러 응답:", error.response?.data);
      throw error;
    }
  },

  // 주소 삭제
  deleteAddress: async (addressId: number) => {
    try {
      console.log("주소 삭제 API 요청:", addressId);
      const response = await api.delete(
        `/api/v1/members/me/addresses/${addressId}`
      );
      console.log("주소 삭제 API 응답:", response.data);
    } catch (error: any) {
      console.error("주소 삭제 실패:", error);
      console.error("에러 응답:", error.response?.data);
      throw error;
    }
  },

  // 기본 주소 설정
  setPrimaryAddress: async (addressId: number) => {
    try {
      console.log("기본 주소 설정 API 요청:", addressId);
      const response = await api.put<Address>(
        `/api/v1/members/me/addresses/${addressId}/primary`
      );
      console.log("기본 주소 설정 API 응답:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("기본 주소 설정 실패:", error);
      console.error("에러 응답:", error.response?.data);
      throw error;
    }
  },
};
