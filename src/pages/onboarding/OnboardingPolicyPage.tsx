import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { getPolicies, getPolicyDetail } from "../../services/policy.service";
import { onboardingService } from "../../services/onboarding.service";
import { useAuthStore } from "../../store/authStore";
import type { Policy } from "../../types/api";

const OnboardingPolicyPage = () => {
  const navigate = useNavigate();
  const { updateMember } = useAuthStore();

  // 약관 목록 상태
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 동의 상태 (약관 ID를 키로 사용)
  const [agreements, setAgreements] = useState<{ [key: number]: boolean }>({});

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [modalContent, setModalContent] = useState("");

  // 약관 목록 불러오기
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        const data = await getPolicies();

        console.log("원본 약관 데이터:", data.policies);

        // API 응답의 type에 따라 필수/선택 판단 및 변환
        const policiesWithType = data.policies.map((policy) => {
          // TERMS_OF_SERVICE(서비스 이용 약관), PRIVACY_POLICY(개인정보 처리방침)는 필수
          // MARKETING_CONSENT(마케팅 수신 동의)는 선택
          const isRequired =
            policy.type === "TERMS_OF_SERVICE" ||
            policy.type === "PRIVACY_POLICY";

          const displayType = isRequired ? "REQUIRED" : "OPTIONAL";

          console.log(
            `약관 ${policy.policyId}: 원본 type=${policy.type}, isRequired=${isRequired}, displayType=${displayType}`
          );

          return {
            ...policy,
            isRequired: isRequired,
            displayType: displayType as "REQUIRED" | "OPTIONAL",
          };
        });

        // 필수 약관이 먼저 오도록 정렬
        const sortedPolicies = policiesWithType.sort((a, b) => {
          if (a.isRequired === b.isRequired) return 0;
          return a.isRequired ? -1 : 1;
        });

        console.log("정렬된 약관 목록:", sortedPolicies);

        setPolicies(sortedPolicies);

        // 초기 동의 상태 설정 (모두 false)
        const initialAgreements: { [key: number]: boolean } = {};
        sortedPolicies.forEach((policy) => {
          initialAgreements[policy.policyId] = false;
        });
        setAgreements(initialAgreements);
      } catch (err) {
        console.error("약관 목록 로드 실패:", err);
        setError("약관을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  // 약관 상세 보기
  const handleViewPolicy = async (policy: Policy) => {
    try {
      const detail = await getPolicyDetail(policy.policyId);
      setSelectedPolicy(policy);
      setModalContent(detail.content);
      setIsModalOpen(true);
    } catch (err) {
      console.error("약관 상세 로드 실패:", err);
      alert("약관 상세 정보를 불러오는데 실패했습니다.");
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
    setModalContent("");
  };

  // 동의 상태 변경
  const handleAgreeChange = (policyId: number, agreed: boolean) => {
    setAgreements((prev) => ({
      ...prev,
      [policyId]: agreed,
    }));
  };

  // 필수 약관 모두 동의 여부 확인
  const isAllRequiredAgreed = () => {
    return policies
      .filter((policy) => policy.displayType === "REQUIRED")
      .every((policy) => agreements[policy.policyId] === true);
  };

  // 가입 완료
  const handleComplete = async () => {
    if (!isAllRequiredAgreed()) {
      alert("필수 약관에 모두 동의해주세요.");
      return;
    }

    try {
      // 약관 동의 API 호출 - 모든 약관의 동의 상태를 전송
      const agreementData = policies.map((policy) => ({
        policyId: policy.policyId,
        isAgreed: agreements[policy.policyId] === true,
      }));

      console.log("약관 동의 데이터 전송:", agreementData);

      const response = await onboardingService.savePolicyAgreements({
        agreements: agreementData,
      });

      console.log("약관 동의 응답:", response);

      // 약관 동의 성공 확인
      if (response.result === "SUCCESS" && response.data) {
        console.log("약관 동의 완료:", response.data.message);
        console.log("동의한 약관 수:", response.data.agreedCount);

        // 온보딩 완료 상태 업데이트
        updateMember({ isOnboardingComplete: true });

        // 로컬 스토리지 강제 동기화 (persist middleware가 즉시 반영되지 않을 수 있음)
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          if (parsed.state && parsed.state.member) {
            parsed.state.member.isOnboardingComplete = true;
            localStorage.setItem("auth-storage", JSON.stringify(parsed));
            console.log("로컬 스토리지 온보딩 상태 업데이트 완료");
          }
        }

        // 약관 동의 완료 - 홈으로 이동
        navigate("/home", { replace: true });
      } else {
        console.error("약관 동의 처리 실패:", response);
        alert("약관 동의 처리 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      console.error("약관 동의 처리 실패:", err);
      console.error("에러 응답:", err.response);
      console.error("에러 데이터:", err.response?.data);

      // 422 에러: 필수 약관 미동의
      if (err.response?.status === 422) {
        alert("필수 약관에 모두 동의해주세요.");
      } else {
        const errorMessage =
          err.response?.data?.error?.message ||
          "약관 동의 처리 중 오류가 발생했습니다.";
        alert(`${errorMessage}\n다시 시도해주세요.`);
      }
    }
  };

  // 가입 취소
  const handleCancel = () => {
    if (window.confirm("회원가입을 취소하시겠습니까?")) {
      navigate("/login-options", { replace: true });
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>신규 회원 가입(이용 약관 동의)</Title>
        </Header>
        <LoadingContainer>약관을 불러오는 중...</LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>신규 회원 가입(이용 약관 동의)</Title>
        </Header>
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={() => window.location.reload()}>
            다시 시도
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>신규 회원 가입(이용 약관 동의)</Title>
      </Header>

      <Content>
        {policies.map((policy) => (
          <Section
            key={policy.policyId}
            $isRequired={policy.displayType === "REQUIRED"}
          >
            <SectionHeader>
              <SectionTitleWrapper>
                {policy.displayType === "REQUIRED" && (
                  <RequiredBadge>필수</RequiredBadge>
                )}
                {policy.displayType === "OPTIONAL" && (
                  <OptionalBadge>선택</OptionalBadge>
                )}
                <SectionTitle $isRequired={policy.displayType === "REQUIRED"}>
                  {policy.title}
                </SectionTitle>
              </SectionTitleWrapper>
              <ViewDetailButton onClick={() => handleViewPolicy(policy)}>
                상세보기
              </ViewDetailButton>
            </SectionHeader>
            <AgreementRow>
              <AgreementCard
                $active={agreements[policy.policyId] === true}
                onClick={() => handleAgreeChange(policy.policyId, true)}
              >
                <CheckIcon $active={agreements[policy.policyId] === true}>
                  ✓
                </CheckIcon>
                <AgreementLabel>동의함</AgreementLabel>
              </AgreementCard>
              <AgreementCard
                $active={agreements[policy.policyId] === false}
                onClick={() => handleAgreeChange(policy.policyId, false)}
                $decline
              >
                <CheckIcon
                  $active={agreements[policy.policyId] === false}
                  $decline
                >
                  ✕
                </CheckIcon>
                <AgreementLabel>동의안함</AgreementLabel>
              </AgreementCard>
            </AgreementRow>
            {policy.displayType === "REQUIRED" &&
              !agreements[policy.policyId] && (
                <RequiredNotice>* 필수 약관에 동의해주세요</RequiredNotice>
              )}
          </Section>
        ))}

        <ButtonGroup>
          <CompleteButton
            onClick={handleComplete}
            disabled={!isAllRequiredAgreed()}
          >
            가입완료
          </CompleteButton>
          <CancelButton onClick={handleCancel}>가입취소</CancelButton>
        </ButtonGroup>
      </Content>

      {/* 약관 상세보기 모달 */}
      {isModalOpen && selectedPolicy && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedPolicy.title}</ModalTitle>
              <CloseButton onClick={handleCloseModal}>✕</CloseButton>
            </ModalHeader>
            <ModalBody>
              <PolicyContent>{modalContent}</PolicyContent>
            </ModalBody>
            <ModalFooter>
              <ModalCloseButton onClick={handleCloseModal}>
                닫기
              </ModalCloseButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
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

const Section = styled.section<{ $isRequired?: boolean }>`
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background-color: ${(props) => (props.$isRequired ? "#fff8f5" : "white")};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${(props) => (props.$isRequired ? "#ffccbc" : "#e0e0e0")};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex: 1;
`;

const SectionTitle = styled.h2<{ $isRequired?: boolean }>`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) => (props.$isRequired ? "#d32f2f" : "#212121")};
  margin: 0;
`;

const RequiredBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background-color: #d32f2f;
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  border-radius: ${theme.borderRadius.md};
  flex-shrink: 0;
`;

const OptionalBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background-color: #757575;
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  flex-shrink: 0;
`;

const RequiredNotice = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #d32f2f;
  margin: ${theme.spacing.sm} 0 0 0;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ViewDetailButton = styled.button`
  padding: 4px 12px;
  background-color: white;
  color: ${theme.colors.accent};
  border: 1px solid ${theme.colors.accent};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${theme.colors.accent};
    color: white;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: ${theme.typography.fontSize.lg};
  color: #757575;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
`;

const ErrorMessage = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: #d32f2f;
  text-align: center;
`;

const RetryButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e55a2b;
  }
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

// 모달 스타일 컴포넌트
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  color: #757575;
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #212121;
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  flex: 1;
`;

const PolicyContent = styled.div`
  font-size: ${theme.typography.fontSize.base};
  line-height: 1.6;
  color: #424242;
  white-space: pre-wrap;
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
`;

const ModalCloseButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default OnboardingPolicyPage;
