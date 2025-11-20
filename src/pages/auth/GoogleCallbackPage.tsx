import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/authStore";

/**
 * 구글 OAuth 콜백 페이지
 * 구글 인증 후 리다이렉트되는 페이지
 */
const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // URL에서 인증 코드 또는 에러 추출
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(`구글 로그인 실패: ${errorParam}`);
          setTimeout(() => navigate("/login-options"), 3000);
          return;
        }

        if (!code) {
          setError("인증 코드가 없습니다.");
          setTimeout(() => navigate("/login-options"), 3000);
          return;
        }

        // 백엔드 API 호출
        const response = await authService.googleLogin({
          authorizationCode: code,
          redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
        });

        if (response.result === "SUCCESS" && response.data) {
          const { memberId, email, name, accessToken, refreshToken, onboardingComplete } =
            response.data;

          console.log("구글 로그인 성공 - 온보딩 상태:", onboardingComplete);

          // 토큰 및 회원 정보 저장
          const { setAuth } = useAuthStore.getState();
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

          // 온보딩 상태에 따라 이동
          if (onboardingComplete) {
            navigate("/home", { replace: true });
          } else {
            navigate("/onboarding/profile", { replace: true });
          }
        } else {
          setError(response.error?.message || "로그인에 실패했습니다.");
          setTimeout(() => navigate("/login-options"), 3000);
        }
      } catch (err: any) {
        console.error("구글 로그인 에러:", err);
        setError(err.message || "로그인 중 오류가 발생했습니다.");
        setTimeout(() => navigate("/login-options"), 3000);
      }
    };

    handleGoogleCallback();
  }, [navigate, searchParams]);

  return (
    <Container>
      <Content>
        {error ? (
          <>
            <ErrorIcon>❌</ErrorIcon>
            <ErrorMessage>{error}</ErrorMessage>
            <SubMessage>로그인 페이지로 돌아갑니다...</SubMessage>
          </>
        ) : (
          <>
            <Spinner />
            <Message>구글 로그인 처리 중...</Message>
            <SubMessage>잠시만 기다려주세요.</SubMessage>
          </>
        )}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
`;

const Content = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #00796b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Message = styled.h2`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const SubMessage = styled.p`
  font-size: 0.875rem;
  color: #666;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.h2`
  font-size: 1.25rem;
  color: #c62828;
  margin-bottom: 0.5rem;
`;

export default GoogleCallbackPage;
