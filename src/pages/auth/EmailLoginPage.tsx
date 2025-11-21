import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiMapPin, FiSettings } from "react-icons/fi";
import { PiBowlFoodFill, PiHamburgerFill } from "react-icons/pi";
import { authService } from "../../services/auth.service.ts";
import { useAuthStore } from "../../store/authStore";
import { syncOnboardingStatus } from "../../utils/onboardingStatus";

const EmailLoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API Call
    setLoading(true);
    try {
      const response = await authService.login(formData);

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
      } else if (response.error) {
        setGeneralError(response.error.message);
      }
    } catch (error: any) {
      console.error("로그인 에러:", error);
      if (error.response?.data?.error) {
        setGeneralError(error.response.data.error.message);
      } else {
        setGeneralError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>알뜰식탁</Title>
        </Header>

        <Form onSubmit={handleSubmit}>
          {generalError && <ErrorMessage>{generalError}</ErrorMessage>}

          <InputGroup>
            <Label>이메일</Label>
            <StyledInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력해주세요"
              $hasError={!!errors.email}
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <StyledInput
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
              $hasError={!!errors.password}
            />
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </LoginButton>

          <SignupButton type="button" onClick={() => navigate("/signup")}>
            회원가입
          </SignupButton>
        </Form>

        <FeatureSection>
          <FeatureTitle>식비를 효율적으로 활용하세요</FeatureTitle>

          <FeatureCard>
            <FeatureCardHeader>
              <FeatureCardIcon>
                <FiSettings />
              </FeatureCardIcon>
              <FeatureCardTitle>식비 설정</FeatureCardTitle>
            </FeatureCardHeader>
            <FeatureCardSubtitle>목표한 금액을 설정하세요</FeatureCardSubtitle>
            <FeatureCardDescription>가용 식비 설정</FeatureCardDescription>
            <FeatureCardDescription>
              매달 목표한 금액을 설정하고 관리하여 절약 효과를 높여보세요
            </FeatureCardDescription>
            <FeatureEmoji>
              <PiHamburgerFill />
              <PiBowlFoodFill />
            </FeatureEmoji>
          </FeatureCard>

          <FeatureCard>
            <FeatureCardHeader>
              <FeatureCardIcon>
                <FiMapPin />
              </FeatureCardIcon>
              <FeatureCardTitle>음식점 추천</FeatureCardTitle>
            </FeatureCardHeader>
            <FeatureCardSubtitle>맛집 추천</FeatureCardSubtitle>
            <FeatureCardDescription>
              가용 식비를 바탕으로 맞는 음식점을 추천해드립니다
            </FeatureCardDescription>
            <FeatureEmoji>
              <PiHamburgerFill />
              <PiBowlFoodFill />
            </FeatureEmoji>
          </FeatureCard>
        </FeatureSection>
      </ContentContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1.5rem;
  background-color: #ffffff;
  width: 100%;
  overflow-y: auto;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #000000;
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1px solid ${(props) => (props.$hasError ? "#ff4444" : "#e0e0e0")};
  border-radius: 8px;
  font-size: 1rem;
  color: #000000;
  background-color: #ffffff;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#ff4444" : "#00796b")};
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  font-size: 0.75rem;
  color: #ff4444;
  margin: 0;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 8px;
  color: #c62828;
  font-size: 0.875rem;
  text-align: center;
`;

const LoginButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ff6b35;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #ff5722;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
  }
`;

const SignupButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const FeatureSection = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeatureTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.5rem 0;
`;

const FeatureCard = styled.div`
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FeatureCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const FeatureCardIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.25rem;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FeatureCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
`;

const FeatureCardSubtitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const FeatureCardDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  line-height: 1.4;
`;

const FeatureEmoji = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;

  svg {
    width: 28px;
    height: 28px;
  }
`;

export default EmailLoginPage;
