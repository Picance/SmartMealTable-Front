import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authService } from "../../services/auth.service.ts";
import { useAuthStore } from "../../store/authStore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdCheckCircle } from "react-icons/md";

const EmailSignupPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    // 최소 8자, 영문/숫자/특수문자 조합
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // 이메일 변경 시 중복 확인 상태 초기화
    if (name === "email") {
      setEmailAvailable(null);
      setEmailChecked(false);
    }
  };

  // 이메일 중복 확인 버튼 클릭 핸들러
  const handleCheckEmail = async () => {
    if (!formData.email) {
      setErrors((prev) => ({
        ...prev,
        email: "이메일을 입력해주세요",
      }));
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "올바른 이메일 형식이 아닙니다",
      }));
      return;
    }

    setCheckingEmail(true);
    setErrors((prev) => ({ ...prev, email: "" }));

    try {
      const response = await authService.checkEmail(formData.email);

      if (response.result === "SUCCESS" && response.data) {
        setEmailAvailable(response.data.available);
        setEmailChecked(true);

        if (!response.data.available) {
          setErrors((prev) => ({
            ...prev,
            email: response.data?.message || "이미 사용 중인 이메일입니다",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "이메일 확인 중 오류가 발생했습니다",
        }));
      }
    } catch (error: any) {
      console.error("Email check error:", error);
      setErrors((prev) => ({
        ...prev,
        email:
          error.response?.data?.error?.message ||
          "이메일 확인 중 오류가 발생했습니다",
      }));
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    } else if (
      formData.name.trim().length < 2 ||
      formData.name.trim().length > 50
    ) {
      newErrors.name = "이름은 2-50자 사이여야 합니다";
    }

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    } else if (!emailChecked) {
      newErrors.email = "이메일 중복 확인을 해주세요";
    } else if (emailAvailable === false) {
      newErrors.email = "이미 사용 중인 이메일입니다";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "비밀번호는 8자 이상의 영문, 숫자, 특수문자 조합이어야 합니다";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API Call
    setLoading(true);
    try {
      const response = await authService.signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });

      if (response.result === "SUCCESS" && response.data) {
        const { member, accessToken, refreshToken } = response.data;
        setAuth(member, accessToken, refreshToken);
        navigate("/onboarding/profile", { replace: true });
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error.message });
      } else {
        setErrors({ general: "회원가입에 실패했습니다. 다시 시도해주세요." });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    validateEmail(formData.email) &&
    emailChecked &&
    emailAvailable === true;

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>회원 가입</Title>
        </Header>

        <Form onSubmit={handleSubmit}>
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <InputGroup>
            <Label>이름</Label>
            <StyledInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="김민준"
              $hasError={!!errors.name}
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>이메일</Label>
            <EmailInputContainer>
              <EmailInputWrapper>
                <StyledInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="minjun.kim@example.com"
                  $hasError={!!errors.email}
                />
                {emailAvailable === true && emailChecked && (
                  <ValidationIcon>
                    <MdCheckCircle size={20} />
                  </ValidationIcon>
                )}
              </EmailInputWrapper>
              <CheckButton
                type="button"
                onClick={handleCheckEmail}
                disabled={
                  !formData.email ||
                  !validateEmail(formData.email) ||
                  checkingEmail
                }
              >
                {checkingEmail ? "확인 중..." : "중복 확인"}
              </CheckButton>
            </EmailInputContainer>
            {emailAvailable === true && emailChecked && (
              <SuccessText>사용 가능한 이메일입니다</SuccessText>
            )}
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <PasswordInputWrapper>
              <StyledInput
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="SecurePassword123!"
                $hasError={!!errors.password}
              />
              <EyeIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </EyeIcon>
            </PasswordInputWrapper>
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>비밀번호 확인</Label>
            <PasswordInputWrapper>
              <StyledInput
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="SecurePassword123!"
                $hasError={!!errors.confirmPassword}
              />
              <EyeIcon
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </EyeIcon>
            </PasswordInputWrapper>
            {errors.confirmPassword && (
              <ErrorText>{errors.confirmPassword}</ErrorText>
            )}
          </InputGroup>

          <SubmitButton type="submit" disabled={!isFormValid || loading}>
            {loading ? "처리 중..." : "다음"}
          </SubmitButton>
        </Form>

        <Footer>
          이미 계정이 있으신가요?{" "}
          <LoginLink onClick={() => navigate("/login")}>로그인</LoginLink>
        </Footer>
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

const EmailInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

const EmailInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const CheckButton = styled.button`
  height: 48px;
  padding: 0 1rem;
  border: 1px solid #00796b;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #00796b;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 88px;

  &:hover:not(:disabled) {
    background-color: #00796b;
    color: white;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    border-color: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
    background-color: #f5f5f5;
  }
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

const ValidationIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #4caf50;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const EyeIcon = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    color: #000000;
  }
`;

const SuccessText = styled.p`
  font-size: 0.75rem;
  color: #4caf50;
  margin: 0;
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

const SubmitButton = styled.button`
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
  margin-top: 1rem;

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

const Footer = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: #666666;
  margin-top: 1rem;
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: #ff6b35;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default EmailSignupPage;
