import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { authService } from "../../services/auth.service.ts";
import { useAuthStore } from "../../store/authStore";
import { MdPerson, MdEmail, MdArrowBack } from "react-icons/md";
import "./EmailSignupPage.css";

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
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

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

    if (name === "email") {
      setEmailAvailable(null);
    }
  };

  const checkEmailAvailability = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "올바른 이메일 형식이 아닙니다",
      }));
      return;
    }

    setEmailChecking(true);
    try {
      const response = await authService.checkEmail(formData.email);
      setEmailAvailable(response.available);
      if (!response.available) {
        setErrors((prev) => ({
          ...prev,
          email: "이미 사용 중인 이메일입니다",
        }));
      }
    } catch (error) {
      console.error("Email check error:", error);
    } finally {
      setEmailChecking(false);
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
    } else if (emailAvailable === false) {
      newErrors.email = "이미 사용 중인 이메일입니다";
    } else if (emailAvailable === null) {
      newErrors.email = "이메일 중복 확인을 해주세요";
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
    emailAvailable === true;

  return (
    <div className="email-signup-page">
      <div className="email-signup-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </button>

        <div className="signup-form-header">
          <h1 className="form-title">회원가입</h1>
          <p className="form-subtitle">알뜰식탁과 함께 시작해보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          <Input
            label="이름"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            error={errors.name}
            fullWidth
            leftIcon={<MdPerson size={20} />}
          />

          <div className="email-input-group">
            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              error={errors.email}
              fullWidth
              leftIcon={<MdEmail size={20} />}
              helperText={
                emailAvailable === true ? "사용 가능한 이메일입니다" : ""
              }
            />
            <Button
              type="button"
              variant="outline"
              size="medium"
              onClick={checkEmailAvailability}
              loading={emailChecking}
              disabled={!formData.email || !validateEmail(formData.email)}
              className="email-check-btn"
            >
              중복확인
            </Button>
          </div>

          <Input
            label="비밀번호"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="8자 이상, 영문/숫자/특수문자 조합"
            error={errors.password}
            fullWidth
          />

          <Input
            label="비밀번호 확인"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호를 다시 입력하세요"
            error={errors.confirmPassword}
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={!isFormValid}
          >
            회원가입
          </Button>
        </form>

        <div className="form-footer">
          <p className="login-prompt">
            이미 계정이 있으신가요?{" "}
            <button className="link-button" onClick={() => navigate("/login")}>
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailSignupPage;
