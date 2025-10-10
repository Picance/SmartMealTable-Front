import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { MdEmail, MdPerson } from "react-icons/md";
import "./LoginOptionsPage.css";

const LoginOptionsPage = () => {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 구현
    console.log("카카오 로그인");
  };

  const handleGoogleLogin = () => {
    // TODO: 구글 로그인 구현
    console.log("구글 로그인");
  };

  return (
    <div className="login-options-page">
      <div className="login-options-container">
        {/* 로고 섹션 */}
        <div className="logo-section">
          <div className="logo-icon">
            <div className="piggy-bank">
              <div className="coin">$</div>
              <div className="bank-body"></div>
            </div>
            <div className="chopsticks"></div>
          </div>
          <h1 className="app-name">알뜰식탁</h1>
        </div>

        {/* 버튼 섹션 */}
        <div className="login-buttons">
          <Button
            variant="primary"
            size="large"
            fullWidth
            icon={<MdEmail size={20} />}
            onClick={() => navigate("/login")}
            className="email-login-btn"
          >
            이메일로 로그인
          </Button>

          <Button
            variant="outline"
            size="large"
            fullWidth
            icon={<RiKakaoTalkFill size={20} />}
            onClick={handleKakaoLogin}
            className="kakao-login-btn"
          >
            카카오로 로그인
          </Button>

          <Button
            variant="outline"
            size="large"
            fullWidth
            icon={<FcGoogle size={20} />}
            onClick={handleGoogleLogin}
            className="google-login-btn"
          >
            구글로 로그인
          </Button>

          <Button
            variant="secondary"
            size="large"
            fullWidth
            icon={<MdPerson size={20} />}
            onClick={() => navigate("/signup")}
            className="signup-btn"
          >
            회원가입
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginOptionsPage;
