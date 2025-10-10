import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { authService } from "../../services/auth.service.ts";
import { useAuthStore } from "../../store/authStore";
import { MdEmail, MdArrowBack } from "react-icons/md";
import "./EmailLoginPage.css";

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
        const { member, accessToken, refreshToken } = response.data;
        setAuth(member, accessToken, refreshToken);

        if (member.isOnboardingComplete) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboarding/profile", { replace: true });
        }
      } else if (response.error) {
        setGeneralError(response.error.message);
      }
    } catch (error: any) {
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
    <div className="email-login-page">
      <div className="email-login-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </button>

        <div className="login-form-header">
          <h1 className="form-title">로그인</h1>
          <p className="form-subtitle">이메일과 비밀번호를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {generalError && <div className="error-message">{generalError}</div>}

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
          />

          <Input
            label="비밀번호"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            error={errors.password}
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          >
            로그인
          </Button>
        </form>

        <div className="form-footer">
          <p className="signup-prompt">
            계정이 없으신가요?{" "}
            <button className="link-button" onClick={() => navigate("/signup")}>
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailLoginPage;
