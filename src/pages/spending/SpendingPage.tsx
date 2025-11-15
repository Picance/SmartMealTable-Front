import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import BottomNav from "../../components/layout/BottomNav";
import {
  getExpenditures,
  getDailyStatistics,
} from "../../services/expenditure.service";
import { budgetService } from "../../services/budget.service";
import type { Expenditure, DailyStatistic } from "../../types/api";

// 지출 내역에서 일별 통계 생성 (통계 API가 없을 경우 대비)
const generateDailyStatisticsFromExpenditures = (
  expenditures: Expenditure[],
  startDate: string,
  endDate: string
): DailyStatistic[] => {
  // 날짜별로 지출 합계 계산
  const dailyMap = new Map<string, number>();

  expenditures.forEach((exp) => {
    const date = exp.expendedDate.split("T")[0]; // YYYY-MM-DD 형식으로 변환
    const currentAmount = dailyMap.get(date) || 0;
    dailyMap.set(date, currentAmount + exp.amount);
  });

  // 기간 내 모든 날짜 생성 (데이터가 없는 날도 0으로 표시)
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result: DailyStatistic[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const totalSpentAmount = dailyMap.get(dateStr) || 0;
    result.push({
      date: dateStr,
      totalSpentAmount,
      amount: totalSpentAmount, // 하위 호환성
    });
  }

  return result;
};

const SpendingPage = () => {
  const navigate = useNavigate();

  // 필터 상태
  const [period, setPeriod] = useState("월주일");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [dateRange, setDateRange] = useState("1일 ~ 7일");

  // 데이터 상태
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [dailyStatistics, setDailyStatistics] = useState<DailyStatistic[]>([]);
  const [dailyBudget, setDailyBudget] = useState<number>(15000); // 기본값 15000원
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, [year, month, dateRange]);

  // 날짜 범위에서 시작일과 종료일 추출
  const getDateRangeFromFilter = (rangeStr: string) => {
    const match = rangeStr.match(/(\d+)일\s*~\s*(\d+)일/);
    if (match) {
      return {
        startDay: parseInt(match[1]),
        endDay: parseInt(match[2]),
      };
    }
    return { startDay: 1, endDay: 31 };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 날짜 범위 필터 적용
      const { startDay, endDay } = getDateRangeFromFilter(dateRange);
      const startDate = `${year}-${String(month).padStart(2, "0")}-${String(
        startDay
      ).padStart(2, "0")}`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
        endDay
      ).padStart(2, "0")}`;

      console.log("데이터 로드 범위:", { startDate, endDate });

      // 예산 정보 조회 (현재 날짜의 일별 예산 사용)
      try {
        const today = new Date().toISOString().split("T")[0];
        const budgetResponse = await budgetService.getDailyBudget(today);
        console.log("일별 예산 API 응답:", budgetResponse);

        if (budgetResponse.result === "SUCCESS" && budgetResponse.data) {
          setDailyBudget(budgetResponse.data.totalBudget);
          console.log("일일 예산 설정:", budgetResponse.data.totalBudget);
        }
      } catch (budgetErr) {
        console.warn("예산 조회 실패, 기본값 사용:", budgetErr);
      }

      // 지출 내역 조회
      const expenditureParams: any = {
        startDate,
        endDate,
        page: 0,
        size: 100,
      };

      const expenditureResponse = await getExpenditures(expenditureParams);

      if (
        expenditureResponse.result === "SUCCESS" &&
        expenditureResponse.data
      ) {
        const responseData = expenditureResponse.data;

        // API 응답 구조: data.expenditures.content
        if (responseData.expenditures && responseData.expenditures.content) {
          setExpenditures(responseData.expenditures.content);
        } else {
          console.warn("예상치 못한 API 응답 구조:", responseData);
          setExpenditures([]);
        }
      } else {
        setError(
          expenditureResponse.error?.message ||
            "지출 내역을 불러올 수 없습니다."
        );
      }

      // 일별 통계 조회
      console.log("📊 [1/5] 일별 통계 API 호출 시작...");
      console.log("📊 [2/5] 요청 파라미터:", { startDate, endDate });

      try {
        const statisticsResponse = await getDailyStatistics({
          startDate,
          endDate,
        });

        console.log("📊 [3/5] API 호출 완료! 응답 확인 중...");
        console.log("📊 [4/5] statisticsResponse:", statisticsResponse);
        console.log(
          "📊 [4-1/5] statisticsResponse.result:",
          statisticsResponse?.result
        );
        console.log(
          "📊 [4-2/5] statisticsResponse.data:",
          statisticsResponse?.data
        );
        console.log(
          "📊 [4-3/5] statisticsResponse.data.dailyStatistics:",
          statisticsResponse?.data?.dailyStatistics
        );

        // API 응답 구조 확인
        if (
          statisticsResponse &&
          statisticsResponse.data &&
          statisticsResponse.data.dailyStatistics
        ) {
          console.log("📊 [5/5] ✅ dailyStatistics 발견! 설정 중...");
          console.log(
            "📊 dailyStatistics 배열 길이:",
            statisticsResponse.data.dailyStatistics.length
          );
          console.log(
            "📊 dailyStatistics 첫 번째 항목:",
            statisticsResponse.data.dailyStatistics[0]
          );
          setDailyStatistics(statisticsResponse.data.dailyStatistics);
          console.log("📊 ✅ dailyStatistics 상태 업데이트 완료!");
        } else {
          console.log(
            "📊 [5/5] ⚠️ dailyStatistics를 찾을 수 없습니다. 대체 방법 사용..."
          );

          // 폴백: 지출 내역에서 직접 생성
          if (expenditureResponse.data?.expenditures?.content) {
            console.log("📊 지출 내역에서 통계 생성 시작...");
            const dailyStats = generateDailyStatisticsFromExpenditures(
              expenditureResponse.data.expenditures.content,
              startDate,
              endDate
            );
            console.log("📊 생성된 통계:", dailyStats);
            setDailyStatistics(dailyStats);
            console.log("📊 ✅ 생성된 통계로 상태 업데이트 완료!");
          } else {
            console.log("📊 지출 내역도 없음. 빈 배열 설정.");
            setDailyStatistics([]);
          }
        }
      } catch (statsErr) {
        console.log("📊 ❌ 통계 API 호출 실패!");
        console.error("📊 에러 상세:", statsErr);

        // 폴백: 지출 내역에서 직접 생성
        if (expenditureResponse.data?.expenditures?.content) {
          console.log("📊 에러 발생, 지출 내역에서 통계 생성...");
          const dailyStats = generateDailyStatisticsFromExpenditures(
            expenditureResponse.data.expenditures.content,
            startDate,
            endDate
          );
          console.log("📊 생성된 통계:", dailyStats);
          setDailyStatistics(dailyStats);
        } else {
          console.log("📊 지출 내역도 없음. 빈 배열 설정.");
          setDailyStatistics([]);
        }
      }

      console.log("📊 통계 처리 완료, 다음 단계로...");
    } catch (err: any) {
      console.error("지출 데이터 로드 실패:", err);
      setError(
        err.response?.data?.error?.message ||
          "데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 차트 데이터 변환
  const chartData = dailyStatistics.map((stat) => {
    const date = new Date(stat.date);
    // API가 totalSpentAmount 필드를 사용하고, budget도 포함함
    const spendingAmount = stat.totalSpentAmount ?? stat.amount ?? 0;
    const budgetAmount = stat.budget ?? dailyBudget;

    return {
      date: date.getDate() + "일",
      budget: budgetAmount,
      spending: spendingAmount,
    };
  });

  console.log("📊 최종 차트 데이터:", chartData);
  console.log("📊 일별 통계 원본:", dailyStatistics);
  console.log("📊 기본 일일 예산:", dailyBudget);

  // 식사 유형 표시
  const getMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      BREAKFAST: "아침",
      LUNCH: "점심",
      DINNER: "저녁",
      OTHER: "기타",
    };
    return labels[mealType] || mealType;
  };

  // 카테고리 아이콘
  const getCategoryIcon = (category?: string) => {
    if (!category) return "🍽️";
    const icons: Record<string, string> = {
      KOREAN: "🍚",
      CHINESE: "🥢",
      JAPANESE: "🍣",
      WESTERN: "🍝",
      CAFE: "☕",
      SNACK: "🍪",
      CONVENIENCE: "🏪",
    };
    return icons[category] || "🍽️";
  };

  // 카테고리 배경색
  const getCategoryBgColor = (category?: string) => {
    if (!category) return "#FFF3E0";
    const colors: Record<string, string> = {
      KOREAN: "#FFF3E0",
      CHINESE: "#FFF9E6",
      JAPANESE: "#FFF4E6",
      WESTERN: "#FFE5E5",
      CAFE: "#F5EDE4",
      SNACK: "#FFE5F0",
      CONVENIENCE: "#E6F2FF",
    };
    return colors[category] || "#FFF3E0";
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>지출 내역</Title>
        </Header>
        <LoadingMessage>로딩 중...</LoadingMessage>
        <BottomNav />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>지출 내역</Title>
        </Header>
        <ErrorMessage>
          <div>{error}</div>
          <RetryButton onClick={loadData}>다시 시도</RetryButton>
        </ErrorMessage>
        <BottomNav />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>지출 내역</Title>
      </Header>

      <Content>
        {/* 필터 섹션 */}
        <FilterSection>
          <FilterTitle>필터</FilterTitle>
          <FilterRow>
            <FilterLabel>간격</FilterLabel>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="주간">주간</option>
              <option value="일간">일간</option>
            </Select>
          </FilterRow>
          <FilterRow>
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </Select>
            <Select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}월
                </option>
              ))}
            </Select>
          </FilterRow>
          <FilterRow>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: "100%" }}
            >
              <option>1일 ~ 7일</option>
              <option>8일 ~ 14일</option>
              <option>15일 ~ 21일</option>
              <option>22일 ~ 31일</option>
            </Select>
          </FilterRow>
        </FilterSection>

        {/* 차트 섹션 */}
        <ChartSection>
          <ChartTitle>지출 현황</ChartTitle>
          <Legend>
            <LegendItem>
              <LegendColor color="#5B9BD5" />
              <span>파랜선 : 예산 목표</span>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#FF6B35" />
              <span>주황선 : 지출 내역</span>
            </LegendItem>
          </Legend>
          <ChartWrapper>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#999" }}
                    stroke="#e0e0e0"
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#999" }}
                    stroke="#e0e0e0"
                    tickLine={false}
                    domain={[0, 60000]}
                    ticks={[0, 15000, 30000, 45000, 60000]}
                    tickFormatter={(value: number) => `${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}원`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="#5B9BD5"
                    strokeWidth={2.5}
                    dot={{ fill: "#5B9BD5", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spending"
                    stroke="#FF6B35"
                    strokeWidth={2.5}
                    dot={{ fill: "#FF6B35", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyMessage>통계 데이터를 불러올 수 없습니다.</EmptyMessage>
            )}
          </ChartWrapper>
        </ChartSection>

        {/* 지출 내역 리스트 */}
        <ExpenditureSection>
          <SectionTitle>지출 내역</SectionTitle>
          {expenditures.length === 0 ? (
            <EmptyMessage>등록된 지출 내역이 없습니다.</EmptyMessage>
          ) : (
            <ExpenditureList>
              {expenditures.map((item) => (
                <ExpenditureItem
                  key={item.expenditureId}
                  onClick={() => navigate(`/spending/${item.expenditureId}`)}
                >
                  <IconWrapper $bgColor={getCategoryBgColor(item.categoryName)}>
                    {getCategoryIcon(item.categoryName)}
                  </IconWrapper>
                  <ExpenditureInfo>
                    <ExpendName>{item.storeName}</ExpendName>
                    <ExpendMeta>
                      {getMealTypeLabel(item.mealType)} •{" "}
                      {new Date(item.expendedDate).toLocaleDateString()}
                    </ExpendMeta>
                  </ExpenditureInfo>
                  <ExpenditureAmount $isExpanded={false}>
                    {item.amount.toLocaleString()}원
                  </ExpenditureAmount>
                </ExpenditureItem>
              ))}
            </ExpenditureList>
          )}
        </ExpenditureSection>

        {/* 지출 등록 버튼 */}
        <RegisterButton onClick={() => navigate("/spending/create")}>
          지출 내역 등록하기
        </RegisterButton>
      </Content>

      <BottomNav />
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
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const FilterSection = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.lg} 0;
`;

const FilterRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  font-size: ${theme.typography.fontSize.base};
  color: #424242;
  min-width: 45px;
  display: flex;
  align-items: center;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Select = styled.select`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const ChartSection = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const Legend = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: #757575;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 20px;
  height: 3px;
  background-color: ${(props) => props.color};
  border-radius: 2px;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 250px;
`;

const ExpenditureSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const ExpenditureList = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ExpenditureItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafafa;
  }
`;

const IconWrapper = styled.div<{ $bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) => props.$bgColor || "#FFF3E0"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: ${theme.spacing.md};
`;

const ExpenditureInfo = styled.div`
  flex: 1;
`;

const ExpendName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin-bottom: 4px;
`;

const ExpendMeta = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
`;

const ExpenditureAmount = styled.div<{ $isExpanded?: boolean }>`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);

  &:hover {
    background-color: #e55a2b;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: #999;
  font-size: ${theme.typography.fontSize.base};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: #666;
  font-size: ${theme.typography.fontSize.lg};
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  font-size: ${theme.typography.fontSize.base};
  margin: ${theme.spacing.lg};

  div {
    margin-bottom: ${theme.spacing.md};
  }
`;

const RetryButton = styled.button`
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e55a2b;
  }
`;

export default SpendingPage;
