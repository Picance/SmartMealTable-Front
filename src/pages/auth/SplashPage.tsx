import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { PiBowlFoodFill } from "react-icons/pi";
import { useAuthStore } from "../../store/authStore";
import { theme } from "../../styles/theme";

const SplashPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, member } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      // 디버깅: 현재 상태 로그
      console.log("=== SplashPage 상태 확인 ===");
      console.log("isAuthenticated:", isAuthenticated);
      console.log("member:", member);
      console.log(
        "member?.isOnboardingComplete:",
        member?.isOnboardingComplete
      );

      // 로컬 스토리지 직접 확인
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        console.log("로컬 스토리지 auth-storage:", parsed);
        console.log(
          "로컬 스토리지 isOnboardingComplete:",
          parsed.state?.member?.isOnboardingComplete
        );
      }

      if (isAuthenticated) {
        // 로컬 스토리지에서 직접 확인 (zustand persist 동기화 이슈 대응)
        const authStorage = localStorage.getItem("auth-storage");
        let isOnboardingComplete = member?.isOnboardingComplete || false;

        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          isOnboardingComplete =
            parsed.state?.member?.isOnboardingComplete || false;
        }

        console.log("최종 isOnboardingComplete:", isOnboardingComplete);

        if (isOnboardingComplete) {
          console.log("[SplashPage] 홈으로 이동");
          navigate("/home", { replace: true });
        } else {
          console.log("[SplashPage] 온보딩으로 이동");
          navigate("/onboarding/profile", { replace: true });
        }
      } else {
        console.log("[SplashPage] 로그인 페이지로 이동");
        navigate("/login-options", { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, member, navigate]);

  return (
    <Container>
      <Content>
        <LogoSection>
          <LogoIcon>
            <PiBowlFoodFill />
          </LogoIcon>
          <LogoText>알뜰식탁</LogoText>
          <LogoSubtitle>SmartMealTable</LogoSubtitle>
        </LogoSection>
        <LoaderSection>
          <Spinner />
          <LoadingText>로딩중...</LoadingText>
        </LoaderSection>
      </Content>
    </Container>
  );
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    #00897b 50%,
    ${theme.colors.secondary} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 50px 50px;
    animation: ${fadeIn} 1s ease-out;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing["3xl"]};
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  z-index: 1;
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const LogoIcon = styled.div`
  font-size: 80px;
  animation: ${fadeIn} 1s ease-out 0.2s both;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));

  svg {
    width: 80px;
    height: 80px;
    color: white;
  }
`;

const LogoText = styled.h1`
  font-size: ${theme.typography.fontSize["4xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.02em;
  animation: ${fadeIn} 1s ease-out 0.4s both;
`;

const LogoSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 1s ease-out 0.6s both;
`;

const LoaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  animation: ${fadeIn} 1s ease-out 0.8s both;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: white;
  margin: 0;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export default SplashPage;
