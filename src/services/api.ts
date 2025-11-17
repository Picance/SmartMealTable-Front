import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiResponse } from "../types/api";

// API Base URL (환경변수로 관리)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

console.log("🌐 API Base URL:", BASE_URL);
console.log("🔧 Environment:", import.meta.env.MODE);

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30초로 증가
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "ko-KR",
  },
});

// Request 인터셉터 - 토큰 자동 첨부 및 요청 로깅
apiClient.interceptors.request.use(
  (config) => {
    // 요청 로깅
    console.group(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("🌐 Base URL:", config.baseURL);
    console.log("🔗 Full URL:", `${config.baseURL}${config.url}`);
    console.log("📋 Headers:", config.headers);
    if (config.data) {
      console.log("📦 Request Data:", config.data);
      console.log(
        "📦 Request Data (stringified):",
        JSON.stringify(config.data, null, 2)
      );
    }
    if (config.params) {
      console.log("🔍 Request Params:", config.params);
      console.log(
        "🔍 Params (stringified):",
        JSON.stringify(config.params, null, 2)
      );
    }
    console.groupEnd();

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "🔑 Authorization Token:",
        token ? `${token.substring(0, 20)}...` : "None"
      );
    } else {
      console.warn("⚠️ No Authorization Token found in localStorage");
    }

    console.log("⏱️ Waiting for response (timeout: 30s)...");

    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response 인터셉터 - 에러 처리 및 토큰 갱신 및 응답 로깅
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 성공 응답 로깅
    console.group(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`
    );
    console.log("⏰ Response Time:", new Date().toISOString());
    console.log("📊 Status:", response.status, response.statusText);
    console.log("📦 Response Data:", response.data);
    console.log(
      "📦 Response Data (stringified):",
      JSON.stringify(response.data, null, 2)
    );

    // 데이터 상세 정보
    if (response.data?.data) {
      if (Array.isArray(response.data.data)) {
        console.log("📋 Array Length:", response.data.data.length);
        console.log("📋 First Item:", response.data.data[0]);
      } else if (
        response.data.data.data &&
        Array.isArray(response.data.data.data)
      ) {
        console.log("📋 Nested Array Length:", response.data.data.data.length);
        console.log("📋 First Item:", response.data.data.data[0]);
      }
    }

    console.groupEnd();

    return response;
  },
  async (error) => {
    // 에러 응답 로깅
    if (error.response) {
      console.group(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`
      );
      console.log("⏰ Error Time:", new Date().toISOString());
      console.log(
        "📊 Status:",
        error.response.status,
        error.response.statusText
      );
      console.log("📦 Error Data:", error.response.data);
      console.log("🔧 Error Config:", error.config);
      console.groupEnd();
    } else if (error.request) {
      console.group("❌ API Error: No response received");
      console.log("⏰ Error Time:", new Date().toISOString());
      console.log("🌐 Request was made but no response:", error.request);
      console.log("💬 Error Message:", error.message);
      console.log("🔧 Error Code:", error.code);
      console.groupEnd();
    } else {
      console.error("❌ API Error:", error.message);
    }

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
