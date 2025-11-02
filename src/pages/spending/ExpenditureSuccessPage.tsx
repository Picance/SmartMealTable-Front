import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import BottomNav from "../../components/layout/BottomNav";
import { useCartStore } from "../../store/cartStore";

interface ExpenditureData {
  storeName: string;
  items: Array<{
    foodName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  expendedDate: string;
  expendedTime: string;
}

interface BudgetSummary {
  mealSpent: number;
  mealRemaining: number;
  dailySpent: number;
  dailyRemaining: number;
  monthlyRemaining: number;
}

const ExpenditureSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCartStore();
  
  const expenditureData = location.state?.expenditureData as ExpenditureData;
  const [budgetSummary] = useState<BudgetSummary>({
    mealSpent: expenditureData?.totalAmount || 18500,
    mealRemaining: 1500,
    dailySpent: expenditureData?.totalAmount || 18500,
    dailyRemaining: 41500,
    monthlyRemaining: 345000,
  });

  useEffect(() => {
    if (!expenditureData) {
      // 데이터가 없으면 홈으로 리다이렉트
      navigate("/home", { replace: true });
    } else {
      // 지출 등록 완료 시 장바구니 비우기
      clearCart();
    }
  }, [expenditureData, navigate, clearCart]);

  if (!expenditureData) {
    return null;
  }

  const getMealTypeLabel = () => {
    switch (expenditureData.mealType) {
      case "BREAKFAST": return "아침";
      case "LUNCH": return "점심";
      case "DINNER": return "저녁";
      default: return "식사";
    }
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate("/home")}>
          <FiArrowLeft size={24} />
        </BackButton>
        <Title>지출 등록 완료</Title>
        <Placeholder />
      </Header>

      <Content>
        {/* 성공 메시지 */}
        <SuccessBox>
          <SuccessIcon>
            <FiCheck size={32} color="#ff6b35" />
          </SuccessIcon>
          <SuccessTitle>지출이 성공적으로 등록되었습니다!</SuccessTitle>
          <SuccessSubtext>
            모든 정보가 정확하게 기록되었으며, 예산에 반영되었습니다.
          </SuccessSubtext>
        </SuccessBox>

        {/* 주문 상세 */}
        <Section>
          <SectionTitle>주문 상세</SectionTitle>
          <InfoCard>
            <InfoRow>
              <InfoLabel>상점</InfoLabel>
              <InfoValue>{expenditureData.storeName}</InfoValue>
            </InfoRow>
            
            <Divider />
            
            <OrderTitle>주문 내역</OrderTitle>
            {expenditureData.items.map((item, index) => (
              <OrderItem key={index}>
                <OrderItemInfo>
                  <OrderItemName>{item.foodName} ({item.quantity}개)</OrderItemName>
                </OrderItemInfo>
                <OrderItemPrice>₩{(item.price * item.quantity).toLocaleString()}</OrderItemPrice>
              </OrderItem>
            ))}
            
            <Divider />
            
            <TotalRow>
              <TotalLabel>총 결제 금액</TotalLabel>
              <TotalAmount>₩{expenditureData.totalAmount.toLocaleString()}</TotalAmount>
            </TotalRow>
            
            <Divider />
            
            <InfoRow>
              <InfoLabel>결제 날짜</InfoLabel>
              <InfoValue>
                {expenditureData.expendedDate} {expenditureData.expendedTime}
                <TimeTag>수정</TimeTag>
              </InfoValue>
            </InfoRow>
          </InfoCard>
        </Section>

        {/* 식비 예산 요약 */}
        <Section>
          <SectionTitle>식비 예산 요약</SectionTitle>
          <BudgetCard>
            <BudgetRow>
              <BudgetLabel>{getMealTypeLabel()} 지출 식비</BudgetLabel>
              <BudgetValue>₩{budgetSummary.mealSpent.toLocaleString()}</BudgetValue>
            </BudgetRow>
            
            <BudgetRow $highlight>
              <BudgetLabel $highlight>남은 {getMealTypeLabel()} 식비 예산</BudgetLabel>
              <BudgetValue $highlight>₩{budgetSummary.mealRemaining.toLocaleString()}</BudgetValue>
            </BudgetRow>
            
            <BudgetDivider />
            
            <BudgetRow>
              <BudgetLabel>오늘 지출 식비</BudgetLabel>
              <BudgetValue>₩{budgetSummary.dailySpent.toLocaleString()}</BudgetValue>
            </BudgetRow>
            
            <BudgetRow $highlight>
              <BudgetLabel $highlight>남은 일일 식비 예산</BudgetLabel>
              <BudgetValue $highlight>₩{budgetSummary.dailyRemaining.toLocaleString()}</BudgetValue>
            </BudgetRow>
            
            <BudgetDivider />
            
            <BudgetRow $warning>
              <BudgetLabel $warning>남은 월별 식비 예산</BudgetLabel>
              <BudgetValue $warning>₩{budgetSummary.monthlyRemaining.toLocaleString()}</BudgetValue>
            </BudgetRow>
          </BudgetCard>
        </Section>

        {/* 홈으로 돌아가기 버튼 */}
        <HomeButton onClick={handleGoHome}>
          홈으로 돌아가기
        </HomeButton>
      </Content>

      <BottomNav activeTab="spending" />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0;
`;

const Placeholder = styled.div`
  width: 40px;
`;

const Content = styled.div`
  padding: 16px;
`;

const SuccessBox = styled.div`
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8dd 100%);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 24px;
`;

const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
`;

const SuccessTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #ff6b35;
  margin: 0 0 12px 0;
`;

const SuccessSubtext = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 12px 0;
`;

const InfoCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #000;
  font-weight: 600;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeTag = styled.span`
  font-size: 12px;
  color: #999;
  font-weight: 400;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f0f0f0;
  margin: 16px 0;
`;

const OrderTitle = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin-bottom: 12px;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OrderItemName = styled.span`
  font-size: 14px;
  color: #000;
  font-weight: 500;
`;

const OrderItemPrice = styled.span`
  font-size: 14px;
  color: #000;
  font-weight: 600;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const TotalAmount = styled.span`
  font-size: 18px;
  color: #ff6b35;
  font-weight: 700;
`;

const BudgetCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const BudgetRow = styled.div<{ $highlight?: boolean; $warning?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BudgetLabel = styled.span<{ $highlight?: boolean; $warning?: boolean }>`
  font-size: 14px;
  color: ${props => {
    if (props.$highlight) return '#ff6b35';
    if (props.$warning) return '#ffd54f';
    return '#666';
  }};
  font-weight: 500;
`;

const BudgetValue = styled.span<{ $highlight?: boolean; $warning?: boolean }>`
  font-size: 15px;
  color: ${props => {
    if (props.$highlight) return '#ff6b35';
    if (props.$warning) return '#ffa000';
    return '#000';
  }};
  font-weight: 700;
`;

const BudgetDivider = styled.div`
  height: 1px;
  background-color: #f0f0f0;
  margin: 12px 0;
`;

const HomeButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 24px;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default ExpenditureSuccessPage;
