import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";

const OnboardingBudgetPage = () => {
  const navigate = useNavigate();
  
  // Step 1: 일일 식비 입력
  const [step, setStep] = useState(1);
  const [breakfastBudget, setBreakfastBudget] = useState("");
  const [lunchBudget, setLunchBudget] = useState("");
  const [dinnerBudget, setDinnerBudget] = useState("");
  const [otherBudget, setOtherBudget] = useState("");
  
  // Step 2: 월간 예산 입력
  const [monthlyBudget, setMonthlyBudget] = useState("");
  
  // 모달
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // Step 1 -> Step 2
  const handleStep1Next = () => {
    const total = getDailyTotal();
    if (total > 0) {
      setStep(2);
    }
  };

  // Step 2 -> 저장
  const handleStep2Save = () => {
    const monthly = parseInt(monthlyBudget.replace(/,/g, "")) || 0;
    if (monthly > 0) {
      // TODO: API 호출
      setShowSuccessModal(true);
    }
  };

  // 모달 확인 버튼
  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    navigate("/onboarding/preference"); // 다음 온보딩 단계로
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

      {step === 1 && (
        <>
          <SectionTitle>목표하는 일일 식비 예산을 알려주세요!</SectionTitle>

          <MealSection>
            <MealCard>
              <MealIconLabel>
                <MealIcon>☕</MealIcon>
                <MealLabel>아침</MealLabel>
              </MealIconLabel>
              <MealDescription>아침 식사에 지출할 예산을 설정하세요.</MealDescription>
              <BudgetInputRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <BudgetValue>
                  {breakfastBudget || "0"}
                </BudgetValue>
              </BudgetInputRow>
              <HiddenInput
                type="text"
                value={breakfastBudget}
                onChange={(e) => setBreakfastBudget(handleNumberInput(e.target.value))}
                placeholder="0"
              />
            </MealCard>

            <MealCard>
              <MealIconLabel>
                <MealIcon>☀️</MealIcon>
                <MealLabel>점심</MealLabel>
              </MealIconLabel>
              <MealDescription>점심 식사에 지출할 예산을 설정하세요.</MealDescription>
              <BudgetInputRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <BudgetValue>
                  {lunchBudget || "0"}
                </BudgetValue>
              </BudgetInputRow>
              <HiddenInput
                type="text"
                value={lunchBudget}
                onChange={(e) => setLunchBudget(handleNumberInput(e.target.value))}
                placeholder="0"
              />
            </MealCard>

            <MealCard>
              <MealIconLabel>
                <MealIcon>🌙</MealIcon>
                <MealLabel>저녁</MealLabel>
              </MealIconLabel>
              <MealDescription>저녁 식사에 지출할 예산을 설정하세요.</MealDescription>
              <BudgetInputRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <BudgetValue>
                  {dinnerBudget || "0"}
                </BudgetValue>
              </BudgetInputRow>
              <HiddenInput
                type="text"
                value={dinnerBudget}
                onChange={(e) => setDinnerBudget(handleNumberInput(e.target.value))}
                placeholder="0"
              />
            </MealCard>

            <MealCard>
              <MealIconLabel>
                <MealIcon>🍽️</MealIcon>
                <MealLabel>기타</MealLabel>
              </MealIconLabel>
              <MealDescription>간식, 야식 등 기타 식비 예산을 설정하세요.</MealDescription>
              <BudgetInputRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <BudgetValue>
                  {otherBudget || "0"}
                </BudgetValue>
              </BudgetInputRow>
              <HiddenInput
                type="text"
                value={otherBudget}
                onChange={(e) => setOtherBudget(handleNumberInput(e.target.value))}
                placeholder="0"
              />
            </MealCard>
          </MealSection>

          <TotalSection>
            <TotalLabel>일일 총 예산</TotalLabel>
            <TotalValue>₩ {getDailyTotal().toLocaleString()}</TotalValue>
          </TotalSection>

          <ButtonGroup>
            <SubmitButton onClick={handleStep1Next} disabled={getDailyTotal() === 0}>
              저장
            </SubmitButton>
            <SkipButton onClick={() => navigate("/onboarding/preference")}>
              건너뛰기
            </SkipButton>
          </ButtonGroup>
        </>
      )}

      {step === 2 && (
        <>
          <SectionTitle>일일 식비 예산 요약</SectionTitle>

          <SummaryGrid>
            <SummaryItem>
              <MealIcon small>☕</MealIcon>
              <MealLabel>아침</MealLabel>
              <SummaryRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <SummaryValue>{breakfastBudget || "0"}</SummaryValue>
              </SummaryRow>
            </SummaryItem>

            <SummaryItem>
              <MealIcon small>☀️</MealIcon>
              <MealLabel>점심</MealLabel>
              <SummaryRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <SummaryValue>{lunchBudget || "0"}</SummaryValue>
              </SummaryRow>
            </SummaryItem>

            <SummaryItem>
              <MealIcon small>🌙</MealIcon>
              <MealLabel>저녁</MealLabel>
              <SummaryRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <SummaryValue>{dinnerBudget || "0"}</SummaryValue>
              </SummaryRow>
            </SummaryItem>

            <SummaryItem>
              <MealIcon small>🍽️</MealIcon>
              <MealLabel>기타</MealLabel>
              <SummaryRow>
                <CurrencySymbol>₩</CurrencySymbol>
                <SummaryValue>{otherBudget || "0"}</SummaryValue>
              </SummaryRow>
            </SummaryItem>
          </SummaryGrid>

          <DailyTotalSection>
            <DailyTotalLabel>일일 총 예산</DailyTotalLabel>
            <DailyTotalValue>₩ {getDailyTotal().toLocaleString()}</DailyTotalValue>
          </DailyTotalSection>

          <Divider />

          <SectionTitle>목표하는 월 식비 예산을 알려주세요!</SectionTitle>

          <MonthlyBudgetCard>
            <MonthlyBudgetIcon>💵</MonthlyBudgetIcon>
            <MonthlyBudgetLabel>월간 예산</MonthlyBudgetLabel>
            <MonthlyBudgetDescription>
              매월 지출할 식비 한도를 설정하세요.
            </MonthlyBudgetDescription>
            <MonthlyBudgetInputRow>
              <CurrencySymbol>₩</CurrencySymbol>
              <MonthlyBudgetInput
                type="text"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(handleNumberInput(e.target.value))}
                placeholder="500,000"
              />
            </MonthlyBudgetInputRow>
          </MonthlyBudgetCard>

          <ButtonGroup>
            <SubmitButton onClick={handleStep2Save} disabled={!monthlyBudget}>
              저장
            </SubmitButton>
            <SkipButton onClick={() => navigate("/onboarding/preference")}>
              건너뛰기
            </SkipButton>
          </ButtonGroup>
        </>
      )}

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
            <ModalButton onClick={handleModalConfirm}>
              확인
            </ModalButton>
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
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  cursor: pointer;
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
`;

const MealSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.lg};
`;

const MealCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: relative;
`;

const MealIconLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const MealIcon = styled.span<{ small?: boolean }>`
  font-size: ${props => props.small ? theme.typography.fontSize.xl : theme.typography.fontSize['2xl']};
`;

const MealLabel = styled.span`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
`;

const MealDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.md};
`;

const BudgetInputRow = styled.div`
  background-color: #f5f5f5;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
`;

const CurrencySymbol = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
`;

const BudgetValue = styled.span`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  flex: 1;
  text-align: right;
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const TotalSection = styled.div`
  background-color: #fff8e1;
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
  color: #212121;
`;

const TotalValue = styled.span`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
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
  background-color: ${props => props.disabled ? '#e0e0e0' : theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? '#e0e0e0' : '#e55a2b'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.98)'};
  }
`;

const SkipButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: transparent;
  color: #757575;
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

// Step 2 Styles
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const SummaryItem = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};
`;

const SummaryRow = styled.div`
  background-color: #f5f5f5;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

const SummaryValue = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  flex: 1;
  text-align: right;
`;

const DailyTotalSection = styled.div`
  background-color: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DailyTotalLabel = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: white;
`;

const DailyTotalValue = styled.span`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
`;

const Divider = styled.div`
  height: 8px;
  background-color: #f5f5f5;
  margin: ${theme.spacing.lg} 0;
`;

const MonthlyBudgetCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin: 0 ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const MonthlyBudgetIcon = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  margin-bottom: ${theme.spacing.sm};
`;

const MonthlyBudgetLabel = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin-bottom: ${theme.spacing.xs};
`;

const MonthlyBudgetDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.md};
`;

const MonthlyBudgetInputRow = styled.div`
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

const MonthlyBudgetInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  text-align: right;
  background: transparent;

  &::placeholder {
    color: #bdbdbd;
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
