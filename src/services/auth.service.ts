import api from "./api";
import type {
  ApiResponse,
  AuthResponse,
  EmailCheckResponse,
  LoginRequest,
  SignupRequest,
  SocialLoginRequest,
  SocialLoginResponse,
} from "../types/api";

export const authService = {
  // 이메일 회원가입
  async signup(data: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/signup/email",
      data
    );

    // 회원가입 성공 시 자동 로그인
    if (response.data.result === "SUCCESS" && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    return response.data;
  },

  // 이메일 로그인
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login/email",
      data
    );

    if (response.data.result === "SUCCESS" && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    return response.data;
  },

  // 카카오 로그인
  async kakaoLogin(
    data: SocialLoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login/kakao",
      data
    );

    if (response.data.result === "SUCCESS" && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    return response.data;
  },

  // 구글 로그인
  async googleLogin(
    data: SocialLoginRequest
  ): Promise<ApiResponse<SocialLoginResponse>> {
    const response = await api.post<ApiResponse<SocialLoginResponse>>(
      "/api/v1/auth/login/google",
      data
    );

    return response.data;
  },

  // 로그아웃
  async logout(): Promise<void> {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // 이메일 중복 확인
  async checkEmail(email: string): Promise<ApiResponse<EmailCheckResponse>> {
    try {
      console.log("이메일 중복 확인 요청:", email);
      const response = await api.get<ApiResponse<EmailCheckResponse>>(
        `/api/v1/auth/check-email?email=${encodeURIComponent(email)}`
      );
      console.log("이메일 중복 확인 응답:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("이메일 중복 확인 에러:", error);
      throw error;
    }
  },

  // 토큰 갱신
  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>("/auth/refresh", { refreshToken });
    return response.data;
  },
};
