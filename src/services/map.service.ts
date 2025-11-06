import { api } from "./api";

// 주소 검색 결과 타입
export interface AddressSearchResult {
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
  sido: string;
  sigungu: string;
  dong: string;
  buildingName: string;
  sigunguCode: string;
  bcode: string;
}

// 주소 검색 응답 타입
export interface AddressSearchResponse {
  addresses: AddressSearchResult[];
  totalCount: number;
}

// 역지오코딩 결과 타입
export interface ReverseGeocodeResult {
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
  sido: string;
  sigungu: string;
  dong: string;
  buildingName: string;
  sigunguCode: string;
  bcode: string;
}

export const mapService = {
  // 주소 검색 (Geocoding)
  searchAddress: async (keyword: string, limit: number = 10) => {
    try {
      const response = await api.get<AddressSearchResponse>(
        "/api/v1/maps/search-address",
        {
          params: { keyword, limit },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("주소 검색 실패:", error);
      throw error;
    }
  },

  // 좌표로 주소 조회 (Reverse Geocoding)
  reverseGeocode: async (lat: number, lng: number) => {
    try {
      const response = await api.get<ReverseGeocodeResult>(
        "/api/v1/maps/reverse-geocode",
        {
          params: { lat, lng },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("역지오코딩 실패:", error);
      throw error;
    }
  },
};
