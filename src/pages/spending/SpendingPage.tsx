import { useState } from "react";
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

const SpendingPage = () => {
  const navigate = useNavigate();

  // 필터 상태
  const [period, setPeriod] = useState("월주일");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("10월");
  const [dateRange, setDateRange] = useState("1일 ~ 7일");

  // 차트 데이터
  const chartData = [
    { date: "10월 17일", budget: 20000, spending: 15000 },
    { date: "10월 19일", budget: 20000, spending: 65000 },
    { date: "10월 21일", budget: 20000, spending: 35000 },
    { date: "10월 23일", budget: 20000, spending: 10000 },
    { date: "10월 26일", budget: 20000, spending: 50000 },
  ];

  // 지출 내역 데이터
  const expenditures = [
    {
      id: 1,
      icon: "☕",
      name: "스타벅스",
      category: "아침",
      date: "2023-10-26 08:00",
      amount: 5500,
      bgColor: "#FFF3E0",
    },
    {
      id: 2,
      icon: "🛒",
      name: "이마트",
      category: "점심",
      date: "2023-10-25 12:00",
      amount: 28000,
      bgColor: "#FFF9C4",
    },
    {
      id: 3,
      icon: "☕",
      name: "스타벅스",
      category: "저녁",
      date: "2023-10-26 18:00",
      amount: 5500,
      bgColor: "#FFF3E0",
    },
    {
      id: 4,
      icon: "🏪",
      name: "GS25",
      category: "기타",
      date: "2023-10-26 22:00",
      amount: 5500,
      bgColor: "#FFF3E0",
    },
  ];

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
              <option>월주일</option>
              <option>주간</option>
              <option>일간</option>
            </Select>
          </FilterRow>
          <FilterRow>
            <Select value={year} onChange={(e) => setYear(e.target.value)}>
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </Select>
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option>10월</option>
              <option>11월</option>
              <option>12월</option>
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
          </ChartWrapper>
        </ChartSection>

        {/* 지출 내역 리스트 */}
        <ExpenditureSection>
          <SectionTitle>지출 내역</SectionTitle>
          <ExpenditureList>
            {expenditures.map((item) => (
              <ExpenditureItem
                key={item.id}
                onClick={() => navigate(`/spending/${item.id}`)}
              >
                <IconWrapper bgColor={item.bgColor}>{item.icon}</IconWrapper>
                <ExpenditureInfo>
                  <ExpendName>{item.name}</ExpendName>
                  <ExpendMeta>
                    {item.category} • {item.date}
                  </ExpendMeta>
                </ExpenditureInfo>
                <ExpenditureAmount isExpanded={item.id === 2}>
                  {item.amount.toLocaleString()}원
                  {item.id === 2 && <ExpandIcon>˅</ExpandIcon>}
                </ExpenditureAmount>
              </ExpenditureItem>
            ))}
          </ExpenditureList>
        </ExpenditureSection>

        {/* 지출 등록 버튼 */}
        <RegisterButton onClick={() => navigate("/spending/create")}>
          지출 내역 등록하기
        </RegisterButton>
      </Content>

      <BottomNav activeTab="spending" />
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

const IconWrapper = styled.div<{ bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) => props.bgColor || "#FFF3E0"};
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

const ExpenditureAmount = styled.div<{ isExpanded?: boolean }>`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const ExpandIcon = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.accent};
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

export default SpendingPage;
