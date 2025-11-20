import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { budgetService } from "../../services/budget.service";

const OnboardingBudgetPage = () => {
  const navigate = useNavigate();

  // 일일 식비 입력
  const [breakfastBudget, setBreakfastBudget] = useState("");
  const [lunchBudget, setLunchBudget] = useState("");
  const [dinnerBudget, setDinnerBudget] = useState("");
  const [otherBudget, setOtherBudget] = useState("");

  // 월간 예산 입력
  const [monthlyBudget, setMonthlyBudget] = useState("");

  // 모달
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 일일 총 예산 계산
  const getDailyTotal = () => {
    const breakfast = parseInt(breakfastBudget.replace(/,/g, "")) || 0;
    const lunch = parseInt(lunchBudget.replace(/,/g, "")) || 0;
    const dinner = parseInt(dinnerBudget.replace(/,/g, "")) || 0;
    const other = parseInt(otherBudget.replace(/,/g, "")) || 0;
    return breakfast + lunch + dinner + other;
  };

  // 숫자 입력 처리
  const handleNumberInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    return numbers ? parseInt(numbers).toLocaleString() : "";
  };

  // 저장 처리
  const handleSave = async () => {
    const dailyTotal = getDailyTotal();
    const monthly = parseInt(monthlyBudget.replace(/,/g, "")) || 0;

    if (dailyTotal === 0 || monthly === 0) {
      setError("모든 예산을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const breakfast = parseInt(breakfastBudget.replace(/,/g, "")) || 0;
      const lunch = parseInt(lunchBudget.replace(/,/g, "")) || 0;
      const dinner = parseInt(dinnerBudget.replace(/,/g, "")) || 0;

      const response = await budgetService.createOnboardingBudget({
        monthlyBudget: monthly,
        dailyBudget: dailyTotal,
        mealBudgets: {
          BREAKFAST: breakfast,
          LUNCH: lunch,
          DINNER: dinner,
        },
      });

      if (response.result === "SUCCESS") {
        setShowSuccessModal(true);
      } else {
        setError(response.error?.message || "예산 저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Budget save error:", err);
      setError(
        err.response?.data?.error?.message ||
          "예산 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 확인 버튼
  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    navigate("/onboarding/preference");
  };

  return (
    <Container>
      <Header>
        <Title>신규 회원 목표 예산 등록</Title>
        <ProfileSection>
          <NotificationIcon>🔔</NotificationIcon>
          <ProfileAvatar />
        </ProfileSection>
      </Header>

      <SectionTitle>일일 식비 예산 요약</SectionTitle>

      <MealSection>
        <MealRow>
          <MealIcon>☕</MealIcon>
          <MealLabel>아침</MealLabel>
          <BudgetInputWrapper>
            <CurrencySymbol>₩</CurrencySymbol>
            <BudgetInput
              type="text"
              value={breakfastBudget}
              onChange={(e) =>
                setBreakfastBudget(handleNumberInput(e.target.value))
              }
              placeholder="0"
            />
          </BudgetInputWrapper>
        </MealRow>

        <MealRow>
          <MealIcon>☀️</MealIcon>
          <MealLabel>점심</MealLabel>
          <BudgetInputWrapper>
            <CurrencySymbol>₩</CurrencySymbol>
            <BudgetInput
              type="text"
              value={lunchBudget}
              onChange={(e) =>
                setLunchBudget(handleNumberInput(e.target.value))
              }
              placeholder="0"
            />
          </BudgetInputWrapper>
        </MealRow>

        <MealRow>
          <MealIcon>🌙</MealIcon>
          <MealLabel>저녁</MealLabel>
          <BudgetInputWrapper>
            <CurrencySymbol>₩</CurrencySymbol>
            <BudgetInput
              type="text"
              value={dinnerBudget}
              onChange={(e) =>
                setDinnerBudget(handleNumberInput(e.target.value))
              }
              placeholder="0"
            />
          </BudgetInputWrapper>
        </MealRow>

        <MealRow>
          <MealIcon>🍽️</MealIcon>
          <MealLabel>기타</MealLabel>
          <BudgetInputWrapper>
            <CurrencySymbol>₩</CurrencySymbol>
            <BudgetInput
              type="text"
              value={otherBudget}
              onChange={(e) =>
                setOtherBudget(handleNumberInput(e.target.value))
              }
              placeholder="0"
            />
          </BudgetInputWrapper>
        </MealRow>
      </MealSection>

      <TotalSection>
        <TotalLabel>일일 총 예산</TotalLabel>
        <TotalValue>₩ {getDailyTotal().toLocaleString()}</TotalValue>
      </TotalSection>

      <Divider />

      <SectionTitle>목표하는 월 식비 예산을 알려주세요!</SectionTitle>

      <MonthlySection>
        <MonthlyLabel>💵 월간 예산</MonthlyLabel>
        <MonthlyDescription>
          매월 지출할 식비 한도를 설정하세요.
        </MonthlyDescription>
        <MonthlyInputWrapper>
          <CurrencySymbol>₩</CurrencySymbol>
          <MonthlyInput
            type="text"
            value={monthlyBudget}
            onChange={(e) =>
              setMonthlyBudget(handleNumberInput(e.target.value))
            }
            placeholder="500,000"
          />
        </MonthlyInputWrapper>
      </MonthlySection>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ButtonGroup>
        <SubmitButton
          onClick={handleSave}
          disabled={isLoading || getDailyTotal() === 0 || !monthlyBudget}
        >
          {isLoading ? "저장 중..." : "저장"}
        </SubmitButton>
      </ButtonGroup>

      {showSuccessModal && (
        <ModalOverlay onClick={() => setShowSuccessModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalIcon>💰</ModalIcon>
            <ModalTitle>예산 저장 완료!</ModalTitle>
            <ModalDescription>
              입력하신 예산이 기본 예산으로 설정되었습니다.
            </ModalDescription>
            <ModalSubDescription>
              프로필 탭에서 날짜별 예산 목표를 변경 설정할 수 있습니다.
            </ModalSubDescription>
            <ModalButton onClick={handleModalConfirm}>확인</ModalButton>
          </ModalContent>
        </ModalOverlay>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const NotificationIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;
`;

const ProfileAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.secondary} 100%
  );
  cursor: pointer;
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
`;

const MealSection = styled.div`
  background-color: white;
  margin: 0 ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const MealRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;

  &:not(:last-child) {
    border-bottom: 1px solid #f5f5f5;
  }
`;

const MealIcon = styled.span`
  font-size: ${theme.typography.fontSize["2xl"]};
  width: 40px;
  text-align: center;
`;

const MealLabel = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  min-width: 60px;
`;

const BudgetInputWrapper = styled.div`
  flex: 1;
  background-color: #f5f5f5;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const CurrencySymbol = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
`;

const BudgetInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  text-align: right;

  &::placeholder {
    color: #bdbdbd;
  }
`;

const TotalSection = styled.div`
  background-color: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: white;
`;

const TotalValue = styled.span`
  font-size: ${theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
`;

const Divider = styled.div`
  height: 8px;
  background-color: #f5f5f5;
  margin: ${theme.spacing.lg} 0;
`;

const MonthlySection = styled.div`
  background-color: white;
  margin: 0 ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const MonthlyLabel = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin-bottom: ${theme.spacing.xs};
`;

const MonthlyDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.md};
`;

const MonthlyInputWrapper = styled.div`
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: ${theme.borderRadius.base};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:focus-within {
    border-color: ${theme.colors.accent};
  }
`;

const MonthlyInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: ${theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  text-align: right;
  background: transparent;

  &::placeholder {
    color: #bdbdbd;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} ${theme.spacing.lg} 0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
`;

const ButtonGroup = styled.div`
  padding: 0 ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
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

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 340px;
  width: 100%;
  text-align: center;
`;

const ModalIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin-bottom: ${theme.spacing.md};
`;

const ModalDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: #424242;
  margin-bottom: ${theme.spacing.sm};
  line-height: 1.5;
`;

const ModalSubDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.xl};
  line-height: 1.5;
`;

const ModalButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default OnboardingBudgetPage;
