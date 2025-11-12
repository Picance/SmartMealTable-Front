import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BottomNavigation from "../../components/layout/BottomNav";

const BudgetManagementPage = () => {
  const navigate = useNavigate();

  // 현재 월
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(9);

  // 선택된 날짜
  const [selectedDate, setSelectedDate] = useState(26);

  // 월 목표 예산
  const [monthlyBudget] = useState(800000);

  // 현재 지출
  const [currentSpending] = useState(994910);

  // 일별 지출 데이터 (임시)
  const dailySpending: { [key: number]: number } = {
    21: 69900,
    22: -35100,
    23: -20000,
    24: -52500,
    25: -815,
    26: 0,
  };

  // 식사 예산
  const [lunchBudget, setLunchBudget] = useState("10000");
  const [dinnerBudget, setDinnerBudget] = useState("15000");
  const [snackBudget, setSnackBudget] = useState("20000");
  const [etcBudget, setEtcBudget] = useState("5000");
  const [applyToFuture, setApplyToFuture] = useState(false);

  // 월 변경
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 달력 생성
  const getDaysInMonth = () => {
    const days = new Date(currentYear, currentMonth, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth();

  // 저장
  const handleSave = () => {
    // TODO: API 호출
    alert("예산이 저장되었습니다.");
  };

  // 지출 차이 계산
  const spendingDiff = currentSpending - monthlyBudget;
  const isOverBudget = spendingDiff > 0;

  return (
    <Container>
      <Header>
        <Title>예산 설정</Title>
      </Header>

      <Content>
        {/* 월 선택 */}
        <MonthSelector>
          <MonthButton onClick={handlePrevMonth}>
            <FiChevronLeft />
          </MonthButton>
          <MonthText>
            {currentYear}년 {currentMonth}월
          </MonthText>
          <MonthButton onClick={handleNextMonth}>
            <FiChevronRight />
          </MonthButton>
        </MonthSelector>

        {/* 지출 현황 */}
        <SpendingCard>
          <SpendingLabel>현재 월 지출</SpendingLabel>
          <SpendingAmount isOver={isOverBudget}>
            {currentSpending.toLocaleString()}원
          </SpendingAmount>
          <SpendingDiff isOver={isOverBudget}>
            지난달보다 {Math.abs(spendingDiff).toLocaleString()}원 더 쓰는 중
          </SpendingDiff>
        </SpendingCard>

        {/* 목표 예산 */}
        <BudgetCard>
          <BudgetRow>
            <BudgetLabel>
              {currentYear}년 {currentMonth}월 목표 예산
            </BudgetLabel>
            <EditButton>수정</EditButton>
          </BudgetRow>
          <BudgetAmount>{monthlyBudget.toLocaleString()}원</BudgetAmount>
        </BudgetCard>

        {/* 달력 */}
        <CalendarCard>
          <WeekDays>
            <WeekDay red>일</WeekDay>
            <WeekDay>월</WeekDay>
            <WeekDay>화</WeekDay>
            <WeekDay>수</WeekDay>
            <WeekDay>목</WeekDay>
            <WeekDay>금</WeekDay>
            <WeekDay blue>토</WeekDay>
          </WeekDays>
          <DaysGrid>
            {Array.from({ length: firstDay }).map((_, i) => (
              <DayCell key={`empty-${i}`} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const spending = dailySpending[day];
              const isSelected = day === selectedDate;
              const isSunday = (firstDay + i) % 7 === 0;
              const isSaturday = (firstDay + i) % 7 === 6;

              return (
                <DayCell
                  key={day}
                  $selected={isSelected}
                  onClick={() => setSelectedDate(day)}
                >
                  <DayNumber
                    red={isSunday}
                    blue={isSaturday}
                    $selected={isSelected}
                  >
                    {day}
                  </DayNumber>
                  {spending !== undefined && (
                    <SpendingText positive={spending > 0}>
                      {spending > 0 ? "+" : ""}
                      {Math.abs(spending / 1000).toFixed(0)}
                    </SpendingText>
                  )}
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarCard>

        {/* 일별 예산 설정 */}
        <DailyBudgetCard>
          <DailyBudgetTitle>{selectedDate}일 식사 예산 설정</DailyBudgetTitle>

          <FormGroup>
            <Label>점심 예산</Label>
            <Input
              type="number"
              value={lunchBudget}
              onChange={(e) => setLunchBudget(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>저녁 예산</Label>
            <Input
              type="number"
              value={dinnerBudget}
              onChange={(e) => setDinnerBudget(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>간식 예산</Label>
            <Input
              type="number"
              value={snackBudget}
              onChange={(e) => setSnackBudget(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>기타 예산</Label>
            <Input
              type="number"
              value={etcBudget}
              onChange={(e) => setEtcBudget(e.target.value)}
            />
          </FormGroup>

          <CheckboxRow>
            <Checkbox
              type="checkbox"
              checked={applyToFuture}
              onChange={(e) => setApplyToFuture(e.target.checked)}
            />
            <CheckboxLabel>
              {selectedDate}일 이후 기본 값으로 설정하기
            </CheckboxLabel>
          </CheckboxRow>

          <SaveButton onClick={handleSave}>저장</SaveButton>
        </DailyBudgetCard>
      </Content>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="spending" />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: 80px;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  text-align: center;
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
`;

const MonthButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  color: #424242;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm};

  &:hover {
    color: ${theme.colors.accent};
  }
`;

const MonthText = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const SpendingCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: ${theme.spacing.md};
`;

const SpendingLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.xs};
`;

const SpendingAmount = styled.div<{ isOver?: boolean }>`
  font-size: ${theme.typography.fontSize["4xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${(props) => (props.isOver ? "#d32f2f" : "#212121")};
  margin-bottom: ${theme.spacing.xs};
`;

const SpendingDiff = styled.div<{ isOver?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  color: ${(props) => (props.isOver ? "#d32f2f" : "#4caf50")};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const BudgetCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: ${theme.spacing.lg};
`;

const BudgetRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const BudgetLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
`;

const EditButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: white;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const BudgetAmount = styled.div`
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
`;

const CalendarCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: ${theme.spacing.lg};
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: ${theme.spacing.sm};
`;

const WeekDay = styled.div<{ red?: boolean; blue?: boolean }>`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) =>
    props.red ? "#d32f2f" : props.blue ? "#1976d2" : "#424242"};
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${theme.spacing.xs};
`;

const DayCell = styled.div<{ $selected?: boolean }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    props.$selected ? theme.colors.accent : "transparent"};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s;
  padding: ${theme.spacing.xs};

  &:hover {
    background-color: ${(props) =>
      props.$selected ? theme.colors.accent : "#f5f5f5"};
  }
`;

const DayNumber = styled.div<{
  red?: boolean;
  blue?: boolean;
  $selected?: boolean;
}>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) => {
    if (props.$selected) return "white";
    if (props.red) return "#d32f2f";
    if (props.blue) return "#1976d2";
    return "#212121";
  }};
  margin-bottom: 2px;
`;

const SpendingText = styled.div<{ positive?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${(props) => (props.positive ? "#4caf50" : "#d32f2f")};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const DailyBudgetCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const DailyBudgetTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.lg} 0;
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: #424242;
  margin-bottom: ${theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.lg} 0;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: #424242;
  cursor: pointer;
`;

const SaveButton = styled.button`
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

export default BudgetManagementPage;
