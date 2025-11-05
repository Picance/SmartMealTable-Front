import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { MdEmail, MdPerson } from "react-icons/md";
import { redirectToGoogleLogin } from "../../utils/googleAuth";

const LoginOptionsPage = () => {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 구현
    console.log("카카오 로그인");
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 페이지로 리다이렉트
    redirectToGoogleLogin();
  };

  return (
    <PageContainer>
      <ContentContainer>
        {/* 로고 섹션 */}
        <LogoSection>
          <LogoIcon>
            <PiggyBank>
              <Coin>$</Coin>
              <BankBody />
            </PiggyBank>
            <Chopsticks />
          </LogoIcon>
          <AppName>알뜰식탁</AppName>
        </LogoSection>

        {/* 버튼 섹션 */}
        <ButtonSection>
          <EmailButton onClick={() => navigate("/login")}>
            <MdEmail size={20} />
            이메일로 로그인
          </EmailButton>

          <KakaoButton onClick={handleKakaoLogin}>
            <RiKakaoTalkFill size={20} />
            카카오로 로그인
          </KakaoButton>

          <GoogleButton onClick={handleGoogleLogin}>
            <FcGoogle size={20} />
            구글로 로그인
          </GoogleButton>

          <SignupButton onClick={() => navigate("/signup")}>
            <MdPerson size={20} />
            회원가입
          </SignupButton>
        </ButtonSection>
      </ContentContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* 모바일 동적 뷰포트 높이 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background-color: #ffffff;
  width: 100%;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 390px; /* 모바일 웹뷰 최적화 */
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 1rem 0;
`;

const LogoIcon = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PiggyBank = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Coin = styled.div`
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 3px 10px rgba(255, 152, 0, 0.3);
  z-index: 2;
`;

const BankBody = styled.div`
  width: 90px;
  height: 90px;
  background-color: transparent;
  border: 5px solid #00796b;
  border-radius: 50%;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 55px;
    height: 35px;
    background-color: transparent;
    border: 4px solid #00796b;
    border-radius: 10px 10px 22px 22px;
  }
`;

const Chopsticks = styled.div`
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 110px;
  background-color: #00796b;
  border-radius: 2px;

  &::before {
    content: "";
    position: absolute;
    left: 12px;
    width: 5px;
    height: 110px;
    background-color: #00796b;
    border-radius: 2px;
  }

  &::after {
    content: "";
    position: absolute;
    left: 24px;
    width: 5px;
    height: 110px;
    background-color: #00796b;
    border-radius: 2px;
  }
`;

const AppName = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: #00796b;
  margin: 0;
  letter-spacing: -0.5px;
`;

const ButtonSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const BaseButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  padding: 0 1.5rem;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmailButton = styled(BaseButton)`
  background-color: #ff6b35;
  color: white;

  &:hover:not(:disabled) {
    background-color: #ff5722;
  }
`;

const KakaoButton = styled(BaseButton)`
  background-color: #fee500;
  color: #000000;

  &:hover:not(:disabled) {
    background-color: #fdd835;
  }
`;

const GoogleButton = styled(BaseButton)`
  background-color: white;
  border: 2px solid #dadce0;
  color: #3c4043;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }
`;

const SignupButton = styled(BaseButton)`
  background-color: #ffa726;
  color: white;

  &:hover:not(:disabled) {
    background-color: #fb8c00;
  }
`;

export default LoginOptionsPage;
