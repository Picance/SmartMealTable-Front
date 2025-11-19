import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiResponse } from "../types/api";

// API Base URL (환경변수로 관리)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30초로 증가
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "ko-KR",
  },
});

// Request 인터셉터 - 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터 - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 (인증 만료) 시 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post<ApiResponse>(
            `${BASE_URL}/api/v1/auth/refresh`,
            {
              refreshToken,
            }
          );

          if (response.data.result === "SUCCESS" && response.data.data) {
            const { accessToken } = response.data.data;
            localStorage.setItem("accessToken", accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API 유틸리티 함수들
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config),
};

export default apiClient;
