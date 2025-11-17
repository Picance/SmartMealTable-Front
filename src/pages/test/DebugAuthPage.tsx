import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../../store/authStore";

const DebugAuthPage = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [tokenFromStorage, setTokenFromStorage] = useState<string | null>(null);
  const [refreshTokenFromStorage, setRefreshTokenFromStorage] = useState<
    string | null
  >(null);

  useEffect(() => {
    setTokenFromStorage(localStorage.getItem("accessToken"));
    setRefreshTokenFromStorage(localStorage.getItem("refreshToken"));
  }, []);

  const handleClearAuth = () => {
    authStore.clearAuth();
    setTokenFromStorage(null);
    setRefreshTokenFromStorage(null);
    alert("인증 정보가 삭제되었습니다.");
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <Container>
      <Title>🔐 인증 디버그 페이지</Title>

      <Section>
        <SectionTitle>AuthStore 상태</SectionTitle>
        <InfoRow>
          <Label>인증 여부:</Label>
          <Value $isValid={authStore.isAuthenticated}>
            {authStore.isAuthenticated ? "✅ 로그인됨" : "❌ 로그인 안됨"}
          </Value>
        </InfoRow>
        <InfoRow>
          <Label>사용자:</Label>
          <Value>{authStore.member?.name || "없음"}</Value>
        </InfoRow>
        <InfoRow>
          <Label>이메일:</Label>
          <Value>{authStore.member?.email || "없음"}</Value>
        </InfoRow>
        <InfoRow>
          <Label>AccessToken:</Label>
          <TokenValue>
            {authStore.accessToken
              ? `${authStore.accessToken.substring(0, 30)}...`
              : "없음"}
          </TokenValue>
        </InfoRow>
      </Section>

      <Section>
        <SectionTitle>LocalStorage 상태</SectionTitle>
        <InfoRow>
          <Label>AccessToken:</Label>
          <TokenValue>
            {tokenFromStorage
              ? `${tokenFromStorage.substring(0, 30)}...`
              : "없음"}
          </TokenValue>
        </InfoRow>
        <InfoRow>
          <Label>RefreshToken:</Label>
          <TokenValue>
            {refreshTokenFromStorage
              ? `${refreshTokenFromStorage.substring(0, 30)}...`
              : "없음"}
          </TokenValue>
        </InfoRow>
      </Section>

      <ButtonGroup>
        <Button onClick={handleGoToLogin}>로그인 페이지로 이동</Button>
        <Button $danger onClick={handleClearAuth}>
          인증 정보 삭제
        </Button>
        <Button onClick={() => navigate("/home")}>홈으로 돌아가기</Button>
      </ButtonGroup>

      <Notice>
        💡 <strong>해결 방법:</strong>
        <ul>
          <li>
            로그인이 안 되어 있다면 "로그인 페이지로 이동" 버튼을 클릭하세요.
          </li>
          <li>토큰이 만료되었다면 "인증 정보 삭제" 후 다시 로그인하세요.</li>
          <li>
            로그인 후 홈 페이지에서 추천 페이지로 이동하면 정상 작동합니다.
          </li>
        </ul>
      </Notice>
    </Container>
  );
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
`;

const Section = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
`;

const Label = styled.div`
  font-weight: 600;
  min-width: 130px;
  color: #666;
`;

const Value = styled.div<{ $isValid?: boolean }>`
  flex: 1;
  word-break: break-all;
  color: ${(props) =>
    props.$isValid !== undefined
      ? props.$isValid
        ? "#4caf50"
        : "#f44336"
      : "#333"};
  font-weight: ${(props) => (props.$isValid !== undefined ? "600" : "normal")};
`;

const TokenValue = styled.div`
  flex: 1;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background-color: #fff;
  padding: 8px;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
`;

const Button = styled.button<{ $danger?: boolean }>`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background-color: ${(props) => (props.$danger ? "#f44336" : "#2196f3")};
  color: white;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Notice = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  color: #856404;

  strong {
    display: block;
    margin-bottom: 10px;
  }

  ul {
    margin: 10px 0 0 20px;
  }

  li {
    margin-bottom: 5px;
  }
`;

export default DebugAuthPage;
