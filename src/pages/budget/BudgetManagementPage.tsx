import { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BottomNavigation from "../../components/layout/BottomNav";
import { budgetService } from "../../services/budget.service";
import type {
  MonthlyBudgetResponse,
  DailyBudgetResponse,
} from "../../types/api";

const BudgetManagementPage = () => {
  // 현재 월
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  // 선택된 날짜
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  // 월별 예산 데이터
  const [monthlyData, setMonthlyData] = useState<MonthlyBudgetResponse | null>(
    null
  );

  // 일별 예산 데이터
  const [dailyData, setDailyData] = useState<DailyBudgetResponse | null>(null);

  // 월간 모든 날짜의 예산 데이터 (달력 표시용)
  const [monthlyDailyBudgets, setMonthlyDailyBudgets] = useState<
    Record<number, { budget: number; spent: number; diff: number }>
  >({});

  // 식사 예산
  const [breakfastBudget, setBreakfastBudget] = useState("");
  const [lunchBudget, setLunchBudget] = useState("");
  const [dinnerBudget, setDinnerBudget] = useState("");
  const [otherBudget, setOtherBudget] = useState("");
  const [applyToFuture, setApplyToFuture] = useState(false);

  // 월별 예산 편집 모드
  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [editMonthlyBudget, setEditMonthlyBudget] = useState("");

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 월별 예산 조회
  useEffect(() => {
    loadMonthlyBudget();
  }, [currentYear, currentMonth]);

  // 일별 예산 조회
  useEffect(() => {
    if (selectedDate) {
      loadDailyBudget();
    }
  }, [currentYear, currentMonth, selectedDate]);

  const loadMonthlyBudget = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await budgetService.getMonthlyBudget(
        currentYear,
        currentMonth
      );

      if (response.result === "SUCCESS" && response.data) {
        setMonthlyData(response.data);
      }

      // 해당 월의 모든 날짜별 예산 데이터 조회
      await loadMonthlyDailyBudgets();
    } catch (err: any) {
      console.error("월별 예산 조회 실패:", err);
      setError(
        err.response?.data?.error?.message || "월별 예산을 불러올 수 없습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 월간 모든 날짜의 예산 데이터 조회
  const loadMonthlyDailyBudgets = async () => {
    try {
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const budgetMap: Record<
        number,
        { budget: number; spent: number; diff: number }
      > = {};

      // 각 날짜별로 예산 데이터 조회
      const promises = Array.from({ length: daysInMonth }, async (_, i) => {
        const day = i + 1;
        const dateStr = `${currentYear}-${String(currentMonth).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;

        try {
          const response = await budgetService.getDailyBudget(dateStr);
          if (response.result === "SUCCESS" && response.data) {
            const data = response.data;
            const totalBudget = data.mealBudgets.reduce(
              (sum, meal) => sum + meal.budget,
              0
            );
            const diff = data.totalSpent - totalBudget;
            budgetMap[day] = {
              budget: totalBudget,
              spent: data.totalSpent,
              diff: diff,
            };
          }
        } catch (err) {
          // 예산이 없는 날짜는 무시
          return null;
        }
      });

      await Promise.all(promises);
      setMonthlyDailyBudgets(budgetMap);
    } catch (err) {
      console.error("월간 일별 예산 조회 실패:", err);
    }
  };

  const loadDailyBudget = async () => {
    try {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-${String(selectedDate).padStart(2, "0")}`;
      const response = await budgetService.getDailyBudget(dateStr);

      if (response.result === "SUCCESS") {
        if (response.data) {
          setDailyData(response.data);

          // 끼니별 예산 초기화
          const mealBudgets = response.data.mealBudgets;
          setBreakfastBudget(
            String(
              mealBudgets.find((m) => m.mealType === "BREAKFAST")?.budget || ""
            )
          );
          setLunchBudget(
            String(
              mealBudgets.find((m) => m.mealType === "LUNCH")?.budget || ""
            )
          );
          setDinnerBudget(
            String(
              mealBudgets.find((m) => m.mealType === "DINNER")?.budget || ""
            )
          );
          setOtherBudget(
            String(
              mealBudgets.find((m) => m.mealType === "OTHER")?.budget || ""
            )
          );
        } else {
          // 데이터 없음 (404 정상 처리됨)
          setDailyData(null);
          setBreakfastBudget("");
          setLunchBudget("");
          setDinnerBudget("");
          setOtherBudget("");
        }
      }
    } catch (err: any) {
      console.error("일별 예산 조회 실패:", err);
      setError(
        err.response?.data?.error?.message || "일별 예산을 불러올 수 없습니다."
      );
    }
  };

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

  // 월별 예산 수정 모드 토글
  const handleEditMonthly = () => {
    if (!isEditingMonthly && monthlyData) {
      setEditMonthlyBudget(String(monthlyData.totalBudget));
    }
    setIsEditingMonthly(!isEditingMonthly);
  };

  // 월별 예산 저장
  const handleSaveMonthlyBudget = async () => {
    try {
      if (!editMonthlyBudget) {
        alert("월별 예산을 입력해주세요.");
        return;
      }

      const monthlyFoodBudget = parseInt(editMonthlyBudget);

      if (monthlyFoodBudget < 1000) {
        alert("월별 예산은 최소 1,000원 이상이어야 합니다.");
        return;
      }

      // 일별 기본 예산은 월별 예산을 30으로 나눈 값으로 설정
      const dailyFoodBudget = Math.floor(monthlyFoodBudget / 30);

      setLoading(true);
      const response = await budgetService.updateMonthlyBudget({
        monthlyFoodBudget,
        dailyFoodBudget,
      });

      if (response.result === "SUCCESS") {
        alert(response.data?.message || "예산이 수정되었습니다.");
        setIsEditingMonthly(false);
        loadMonthlyBudget();
      }
    } catch (err: any) {
      console.error("월별 예산 수정 실패:", err);
      alert(err.response?.data?.error?.message || "예산 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 저장
  const handleSave = async () => {
    try {
      if (!breakfastBudget && !lunchBudget && !dinnerBudget && !otherBudget) {
        alert("최소 하나의 끼니 예산을 입력해주세요.");
        return;
      }

      const breakfast = parseInt(breakfastBudget) || 0;
      const lunch = parseInt(lunchBudget) || 0;
      const dinner = parseInt(dinnerBudget) || 0;
      const other = parseInt(otherBudget) || 0;
      const totalDaily = breakfast + lunch + dinner + other;

      if (totalDaily < 100) {
        alert("일일 예산은 최소 100원 이상이어야 합니다.");
        return;
      }

      const dateStr = `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-${String(selectedDate).padStart(2, "0")}`;

      setLoading(true);

      // 일별 예산이 이미 있는지 확인
      const hasExistingBudget = dailyData !== null;

      try {
        let response;

        if (hasExistingBudget) {
          // 기존 예산이 있으면 PUT (수정)
          response = await budgetService.updateDailyBudget(dateStr, {
            dailyFoodBudget: totalDaily,
            applyForward: applyToFuture,
          });
        } else {
          // 기존 예산이 없으면 POST (생성)
          // applyForward가 true면 해당 날짜부터 월말까지 일괄 생성
          const endDate = applyToFuture
            ? `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
                new Date(currentYear, currentMonth, 0).getDate()
              ).padStart(2, "0")}`
            : dateStr;

          response = await budgetService.bulkCreateDailyBudget({
            startDate: dateStr,
            endDate: endDate,
            dailyFoodBudget: totalDaily,
            mealBudgets: {
              BREAKFAST: breakfast,
              LUNCH: lunch,
              DINNER: dinner,
              OTHER: other,
            },
          });
        }

        if (response.result === "SUCCESS") {
          alert(response.data?.message || "예산이 저장되었습니다.");
          loadDailyBudget();
          loadMonthlyBudget();
        }
      } catch (apiErr: any) {
        // PUT 실패 시 (404 등) POST로 재시도
        if (apiErr.response?.status === 404 && hasExistingBudget) {
          const endDate = applyToFuture
            ? `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
                new Date(currentYear, currentMonth, 0).getDate()
              ).padStart(2, "0")}`
            : dateStr;

          const retryResponse = await budgetService.bulkCreateDailyBudget({
            startDate: dateStr,
            endDate: endDate,
            dailyFoodBudget: totalDaily,
            mealBudgets: {
              BREAKFAST: breakfast,
              LUNCH: lunch,
              DINNER: dinner,
              OTHER: other,
            },
          });

          if (retryResponse.result === "SUCCESS") {
            alert(retryResponse.data?.message || "예산이 저장되었습니다.");
            loadDailyBudget();
            loadMonthlyBudget();
          }
        } else {
          throw apiErr;
        }
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || "예산 저장에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 지출 차이 계산
  const spendingDiff = monthlyData
    ? monthlyData.totalSpent - monthlyData.totalBudget
    : 0;
  const isOverBudget = spendingDiff > 0;

  return (
    <Container>
      <Header>
        <Title>예산 설정</Title>
      </Header>

      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}

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
        {monthlyData && (
          <SpendingCard>
            <SpendingLabel>현재 월 지출</SpendingLabel>
            <SpendingAmount $isOver={isOverBudget}>
              {monthlyData.totalSpent.toLocaleString()}원
            </SpendingAmount>
            <SpendingDiff $isOver={isOverBudget}>
              {isOverBudget ? "예산 초과" : "예산 내"}{" "}
              {Math.abs(spendingDiff).toLocaleString()}원
            </SpendingDiff>
            <BudgetProgress>
              <ProgressBar
                $percentage={monthlyData.utilizationRate || 0}
                $isOver={isOverBudget}
              />
            </BudgetProgress>
            <ProgressText>
              사용률: {monthlyData.utilizationRate.toFixed(1)}% | 남은 일수:{" "}
              {monthlyData.daysRemaining}일
            </ProgressText>
          </SpendingCard>
        )}

        {/* 목표 예산 */}
        {monthlyData && (
          <BudgetCard>
            <BudgetRow>
              <BudgetLabel>
                {currentYear}년 {currentMonth}월 목표 예산
              </BudgetLabel>
              {!isEditingMonthly && (
                <EditButton onClick={handleEditMonthly}>수정</EditButton>
              )}
            </BudgetRow>

            {isEditingMonthly ? (
              <>
                <FormGroup>
                  <Label>월별 예산</Label>
                  <Input
                    type="number"
                    value={editMonthlyBudget}
                    onChange={(e) => setEditMonthlyBudget(e.target.value)}
                    placeholder="월별 식비 예산"
                  />
                  <HelpText>
                    일별 기본 예산은 월별 예산을 30으로 나눈 값으로 자동
                    설정됩니다.
                  </HelpText>
                </FormGroup>
                <ButtonRow>
                  <CancelButton onClick={() => setIsEditingMonthly(false)}>
                    취소
                  </CancelButton>
                  <SaveSmallButton onClick={handleSaveMonthlyBudget}>
                    저장
                  </SaveSmallButton>
                </ButtonRow>
              </>
            ) : (
              <BudgetAmount>
                {monthlyData.totalBudget.toLocaleString()}원
              </BudgetAmount>
            )}
          </BudgetCard>
        )}

        {/* 달력 */}
        <CalendarCard>
          <WeekDays>
            <WeekDay $red>일</WeekDay>
            <WeekDay>월</WeekDay>
            <WeekDay>화</WeekDay>
            <WeekDay>수</WeekDay>
            <WeekDay>목</WeekDay>
            <WeekDay>금</WeekDay>
            <WeekDay $blue>토</WeekDay>
          </WeekDays>
          <DaysGrid>
            {Array.from({ length: firstDay }).map((_, i) => (
              <DayCell key={`empty-${i}`} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDate;
              const isSunday = (firstDay + i) % 7 === 0;
              const isSaturday = (firstDay + i) % 7 === 6;
              const budgetInfo = monthlyDailyBudgets[day];

              return (
                <DayCell
                  key={day}
                  $selected={isSelected}
                  onClick={() => setSelectedDate(day)}
                >
                  <DayNumber
                    $red={isSunday}
                    $blue={isSaturday}
                    $selected={isSelected}
                  >
                    {day}
                  </DayNumber>
                  {budgetInfo && budgetInfo.diff !== 0 && (
                    <DayDiff $isOver={budgetInfo.diff > 0}>
                      {budgetInfo.diff > 0 ? "+" : ""}
                      {(budgetInfo.diff / 1000).toFixed(1)}k
                    </DayDiff>
                  )}
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarCard>

        {/* 일별 예산 설정 */}
        <DailyBudgetCard>
          <DailyBudgetTitle>{selectedDate}일 식사 예산 설정</DailyBudgetTitle>

          {/* 현재 일별 예산 정보 */}
          <CurrentBudgetInfo>
            <InfoRow>
              <InfoLabel>설정된 예산:</InfoLabel>
              <InfoValue>
                {dailyData
                  ? dailyData.mealBudgets
                      .reduce((sum, meal) => sum + meal.budget, 0)
                      .toLocaleString()
                  : "0"}
                원
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>사용 금액:</InfoLabel>
              <InfoValue>
                {dailyData ? dailyData.totalSpent.toLocaleString() : "0"}원
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>남은 예산:</InfoLabel>
              <InfoValue
                $isNegative={!!(dailyData && dailyData.remainingBudget < 0)}
              >
                {dailyData ? dailyData.remainingBudget.toLocaleString() : "0"}원
              </InfoValue>
            </InfoRow>
          </CurrentBudgetInfo>

          <FormGroup>
            <Label>아침 예산</Label>
            <Input
              type="number"
              value={breakfastBudget}
              onChange={(e) => setBreakfastBudget(e.target.value)}
              placeholder="아침 예산"
            />
          </FormGroup>

          <FormGroup>
            <Label>점심 예산</Label>
            <Input
              type="number"
              value={lunchBudget}
              onChange={(e) => setLunchBudget(e.target.value)}
              placeholder="점심 예산"
            />
          </FormGroup>

          <FormGroup>
            <Label>저녁 예산</Label>
            <Input
              type="number"
              value={dinnerBudget}
              onChange={(e) => setDinnerBudget(e.target.value)}
              placeholder="저녁 예산"
            />
          </FormGroup>

          <FormGroup>
            <Label>기타 예산</Label>
            <Input
              type="number"
              value={otherBudget}
              onChange={(e) => setOtherBudget(e.target.value)}
              placeholder="기타 예산 (간식 등)"
            />
          </FormGroup>

          <TotalBudgetRow>
            <TotalLabel>합계:</TotalLabel>
            <TotalValue>
              {(
                (parseInt(breakfastBudget) || 0) +
                (parseInt(lunchBudget) || 0) +
                (parseInt(dinnerBudget) || 0) +
                (parseInt(otherBudget) || 0)
              ).toLocaleString()}
              원
            </TotalValue>
          </TotalBudgetRow>

          <CheckboxRow>
            <Checkbox
              type="checkbox"
              checked={applyToFuture}
              onChange={(e) => setApplyToFuture(e.target.checked)}
            />
            <CheckboxLabel>
              {selectedDate}일 이후 모든 날짜에 일괄 적용
            </CheckboxLabel>
          </CheckboxRow>

          <SaveButton onClick={handleSave} disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </SaveButton>
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

const SpendingAmount = styled.div<{ $isOver?: boolean }>`
  font-size: ${theme.typography.fontSize["4xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${(props) => (props.$isOver ? "#d32f2f" : "#212121")};
  margin-bottom: ${theme.spacing.xs};
`;

const SpendingDiff = styled.div<{ $isOver?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  color: ${(props) => (props.$isOver ? "#d32f2f" : "#4caf50")};
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

const BudgetProgress = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: ${theme.spacing.sm} 0;
`;

const ProgressBar = styled.div<{ $percentage: number; $isOver?: boolean }>`
  height: 100%;
  width: ${(props) => Math.min(props.$percentage, 100)}%;
  background-color: ${(props) =>
    props.$isOver ? "#d32f2f" : theme.colors.accent};
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: #757575;
  margin-top: ${theme.spacing.xs};
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const CancelButton = styled.button`
  flex: 1;
  padding: ${theme.spacing.md};
  background-color: white;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SaveSmallButton = styled.button`
  flex: 1;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;

  &:hover {
    background-color: #e55a2b;
  }
`;

const HelpText = styled.p`
  font-size: ${theme.typography.fontSize.xs};
  color: #757575;
  margin-top: ${theme.spacing.xs};
  margin-bottom: 0;
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

const WeekDay = styled.div<{ $red?: boolean; $blue?: boolean }>`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) =>
    props.$red ? "#d32f2f" : props.$blue ? "#1976d2" : "#424242"};
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
  $red?: boolean;
  $blue?: boolean;
  $selected?: boolean;
}>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) => {
    if (props.$selected) return "white";
    if (props.$red) return "#d32f2f";
    if (props.$blue) return "#1976d2";
    return "#212121";
  }};
  margin-bottom: 2px;
`;

const DayDiff = styled.div<{ $isOver: boolean }>`
  font-size: 10px;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) => (props.$isOver ? "#d32f2f" : "#4caf50")};
  line-height: 1;
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

const CurrentBudgetInfo = styled.div`
  background-color: #f5f5f5;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
`;

const InfoValue = styled.span<{ $isNegative?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) => (props.$isNegative ? "#d32f2f" : "#212121")};
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

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const TotalBudgetRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: #f5f5f5;
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
`;

const TotalLabel = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #424242;
`;

const TotalValue = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent};
`;

export default BudgetManagementPage;
