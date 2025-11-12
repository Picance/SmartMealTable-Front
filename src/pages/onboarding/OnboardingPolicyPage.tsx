import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";

const OnboardingPolicyPage = () => {
  const navigate = useNavigate();

  // 동의 상태
  const [serviceAgree, setServiceAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [pushAgree, setPushAgree] = useState(false);

  // 가입 완료
  const handleComplete = () => {
    if (serviceAgree && privacyAgree && pushAgree) {
      // TODO: API 호출
      navigate("/home", { replace: true });
    }
  };

  // 가입 취소
  const handleCancel = () => {
    if (window.confirm("회원가입을 취소하시겠습니까?")) {
      navigate("/login-options", { replace: true });
    }
  };

  return (
    <Container>
      <Header>
        <Title>신규 회원 가입(이용 약관 동의)</Title>
      </Header>

      <Content>
        <Section>
          <SectionTitle>서비스 이용 약관</SectionTitle>
          <AgreementRow>
            <AgreementCard
              $active={serviceAgree}
              onClick={() => setServiceAgree(true)}
            >
              <CheckIcon $active={serviceAgree}>✓</CheckIcon>
              <AgreementLabel>동의함</AgreementLabel>
            </AgreementCard>
            <AgreementCard
              $active={!serviceAgree}
              onClick={() => setServiceAgree(false)}
              $decline
            >
              <CheckIcon $active={!serviceAgree} $decline>
                ✕
              </CheckIcon>
              <AgreementLabel>동의안함</AgreementLabel>
            </AgreementCard>
          </AgreementRow>
        </Section>

        <Section>
          <SectionTitle>개인정보 수집 동의</SectionTitle>
          <AgreementRow>
            <AgreementCard
              $light
              $active={privacyAgree}
              onClick={() => setPrivacyAgree(true)}
            >
              <CheckIcon $active={privacyAgree}>✓</CheckIcon>
              <AgreementLabel>동의함</AgreementLabel>
            </AgreementCard>
            <AgreementCard
              $light
              $active={!privacyAgree}
              onClick={() => setPrivacyAgree(false)}
              $decline
            >
              <CheckIcon $active={!privacyAgree} $decline>
                ✕
              </CheckIcon>
              <AgreementLabel>동의안함</AgreementLabel>
            </AgreementCard>
          </AgreementRow>
        </Section>

        <Section>
          <SectionTitle>푸시 알림 동의</SectionTitle>
          <AgreementRow>
            <AgreementCard
              $light
              $active={pushAgree}
              onClick={() => setPushAgree(true)}
            >
              <CheckIcon $active={pushAgree}>✓</CheckIcon>
              <AgreementLabel>동의함</AgreementLabel>
            </AgreementCard>
            <AgreementCard
              $light
              $active={!pushAgree}
              onClick={() => setPushAgree(false)}
              $decline
            >
              <CheckIcon $active={!pushAgree} $decline>
                ✕
              </CheckIcon>
              <AgreementLabel>동의안함</AgreementLabel>
            </AgreementCard>
          </AgreementRow>
        </Section>

        <ButtonGroup>
          <CompleteButton
            onClick={handleComplete}
            disabled={!serviceAgree || !privacyAgree || !pushAgree}
          >
            가입완료
          </CompleteButton>
          <CancelButton onClick={handleCancel}>가입취소</CancelButton>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: ${theme.spacing.xl};
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  text-align: center;
`;

const Content = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const AgreementRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const AgreementCard = styled.div<{
  $active?: boolean;
  $light?: boolean;
  $decline?: boolean;
}>`
  background-color: ${(props) => {
    if (!props.$active) return "white";
    if (props.$light) return "white";
    return theme.colors.accent;
  }};
  border: 2px solid
    ${(props) => {
      if (props.$active && !props.$light) return theme.colors.accent;
      return "#e0e0e0";
    }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CheckIcon = styled.div<{ $active?: boolean; $decline?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) => {
    if (!props.$active) return "transparent";
    if (props.$decline) return "white";
    return "white";
  }};
  border: 2px solid
    ${(props) => {
      if (!props.$active) return "#e0e0e0";
      if (props.$decline) return "#e0e0e0";
      return "white";
    }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${(props) => {
    if (!props.$active) return "transparent";
    if (props.$decline) return "#ff5252";
    return theme.colors.accent;
  }};
  transition: all 0.2s;
`;

const AgreementLabel = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing["3xl"]};
`;

const CompleteButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${(props) =>
    props.disabled ? "#e0e0e0" : theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#e0e0e0" : "#e55a2b")};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "scale(0.98)")};
  }
`;

const CancelButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: white;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default OnboardingPolicyPage;
