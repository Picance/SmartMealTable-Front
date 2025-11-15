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
import type { Expenditure, DailyStatistic } from "../../types/api";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, [year, month]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 날짜 범위 설정
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
        lastDay
      ).padStart(2, "0")}`;

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

      // 일별 통계 조회 (선택적 - 실패해도 페이지는 정상 표시)
      try {
        const statisticsResponse = await getDailyStatistics({
          startDate,
          endDate,
        });

        if (
          statisticsResponse.result === "SUCCESS" &&
          statisticsResponse.data
        ) {
          setDailyStatistics(statisticsResponse.data.dailyStatistics);
        }
      } catch (statsErr) {
        // 통계 API가 없어도 페이지는 정상 작동
        console.log("통계 API 사용 불가:", statsErr);
        setDailyStatistics([]);
      }
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
  const chartData = dailyStatistics.map((stat) => ({
    date: new Date(stat.date).getDate() + "일",
    budget: 15000, // 임시 예산 값 (추후 실제 예산 API 연동)
    spending: stat.amount,
  }));

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
