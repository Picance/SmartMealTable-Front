import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authService } from "../../services/auth.service";
import {
  extractAuthCodeFromUrl,
  extractErrorFromUrl,
} from "../../utils/kakaoAuth";
import { useAuthStore } from "../../store/authStore";
import { syncOnboardingStatus } from "../../utils/onboardingStatus";

const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        const currentUrl = window.location.href;

        // 에러 확인
        const errorParam = extractErrorFromUrl(currentUrl);
        if (errorParam) {
          throw new Error(`카카오 로그인 실패: ${errorParam}`);
        }

        // 인증 코드 추출
        const authorizationCode = extractAuthCodeFromUrl(currentUrl);
        if (!authorizationCode) {
          throw new Error("인증 코드를 찾을 수 없습니다.");
        }

        // 카카오 로그인 API 호출
        const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
        const response = await authService.kakaoLogin({
          authorizationCode,
          redirectUri,
        });

        if (response.result === "SUCCESS" && response.data) {
          const {
            memberId,
            email,
            name,
            accessToken,
            refreshToken,
            onboardingComplete,
          } = response.data;

          // 토큰 및 회원 정보 저장
          setAuth(
            {
              memberId,
              email,
              name,
              isOnboardingComplete: onboardingComplete,
            },
            accessToken,
            refreshToken
          );

          const resolvedOnboarding = await syncOnboardingStatus(
            onboardingComplete ?? false
          );

          if (resolvedOnboarding) {
            navigate("/home", { replace: true });
          } else {
            navigate("/onboarding/profile", { replace: true });
          }
        } else {
          throw new Error(response.error?.message || "로그인에 실패했습니다.");
        }
      } catch (err: any) {
        console.error("카카오 로그인 처리 중 오류:", err);
        setError(err.message || "로그인 처리 중 오류가 발생했습니다.");

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/login-options", { replace: true });
        }, 3000);
      }
    };

    handleKakaoCallback();
  }, [navigate, setAuth]);

  if (error) {
    return (
      <Container>
        <Content>
          <ErrorIcon>❌</ErrorIcon>
          <Title>로그인 실패</Title>
          <Message>{error}</Message>
          <SubMessage>잠시 후 로그인 페이지로 이동합니다...</SubMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Spinner />
        <Title>카카오 로그인 중...</Title>
        <Message>잠시만 기다려주세요</Message>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 2rem;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #fee500;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
`;

const SubMessage = styled.p`
  font-size: 0.875rem;
  color: #999;
  margin: 0;
`;

export default KakaoCallbackPage;
