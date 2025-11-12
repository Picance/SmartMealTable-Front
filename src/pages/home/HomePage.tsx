import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronDown, FiMapPin } from "react-icons/fi";
import BottomNav from "../../components/layout/BottomNav";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"popular" | "healthy">("popular");

  // 샘플 데이터
  const todaySpent = 80000;
  const remainingBudget = 20000;
  const totalBudget = 100000;

  const popularMenus = [
    { id: 1, name: "맛있는 햄버거", price: 7500, image: "🍔" },
    { id: 2, name: "코코넛 샐러드", price: 6000, image: "🥗" },
  ];

  const restaurants = [
    { id: 1, name: "임식 레스토랑", icon: "🍽️", tag: "도보 5분 거리" },
    { id: 2, name: "피자 가게", icon: "🍕", tag: "학교 근처" },
  ];

  return (
    <Container>
      <Header>
        <Logo>알뜰식탁</Logo>
        <LocationButton>
          <FiMapPin size={16} />
          <span>현재 위치: 서울시 노원구 공릉동</span>
          <FiChevronDown size={16} />
        </LocationButton>
      </Header>

      <Content>
        {/* 식비 예산 현황 */}
        <BudgetSection>
          <SectionHeader>
            <SectionTitle>식비 예산 현황</SectionTitle>
            <ManageButton onClick={() => navigate("/profile/budget")}>
              관리
            </ManageButton>
          </SectionHeader>
          <BudgetCards>
            <BudgetCard>
              <BudgetLabel>오늘 소비 금액</BudgetLabel>
              <BudgetAmount>{todaySpent.toLocaleString()}원</BudgetAmount>
            </BudgetCard>
            <BudgetCard>
              <BudgetLabel>남은 식비</BudgetLabel>
              <BudgetAmount>{remainingBudget.toLocaleString()}원</BudgetAmount>
              <BudgetSubtext>
                설정한 식비: {totalBudget.toLocaleString()}원
              </BudgetSubtext>
            </BudgetCard>
          </BudgetCards>
        </BudgetSection>

        {/* 추천 메뉴 */}
        <RecommendSection>
          <SectionTitle>추천 메뉴</SectionTitle>
          <TabContainer>
            <Tab
              $active={activeTab === "popular"}
              onClick={() => setActiveTab("popular")}
            >
              인기 메뉴
            </Tab>
            <Tab
              $active={activeTab === "healthy"}
              onClick={() => setActiveTab("healthy")}
            >
              건강한 선택
            </Tab>
          </TabContainer>
          <MenuGrid>
            {popularMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                onClick={() => navigate(`/menu/${menu.id}`)}
              >
                <MenuImage>{menu.image}</MenuImage>
                <MenuInfo>
                  <MenuName>{menu.name}</MenuName>
                  <MenuPrice>{menu.price.toLocaleString()}원</MenuPrice>
                </MenuInfo>
              </MenuCard>
            ))}
          </MenuGrid>
        </RecommendSection>

        {/* 식사 추천 */}
        <RestaurantSection>
          <SectionTitle>식사 추천</SectionTitle>
          <RestaurantList>
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                onClick={() => navigate(`/store/${restaurant.id}`)}
              >
                <RestaurantIcon>{restaurant.icon}</RestaurantIcon>
                <RestaurantInfo>
                  <RestaurantName>{restaurant.name}</RestaurantName>
                  <RestaurantTag>{restaurant.tag}</RestaurantTag>
                </RestaurantInfo>
              </RestaurantCard>
            ))}
          </RestaurantList>
        </RestaurantSection>
      </Content>

      <BottomNav activeTab="home" />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.h1`
  font-size: 20px;
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const BudgetSection = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const ManageButton = styled.button`
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e55a2b;
  }
`;

const BudgetCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const BudgetCard = styled.div`
  background-color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const BudgetLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #666;
  margin-bottom: ${theme.spacing.xs};
`;

const BudgetAmount = styled.div`
  font-size: 24px;
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin-bottom: 4px;
`;

const BudgetSubtext = styled.div`
  font-size: 11px;
  color: #999;
`;

const RecommendSection = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${(props) => (props.$active ? "white" : "#f5f5f5")};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.accent : "#e0e0e0")};
  border-radius: 8px;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${(props) =>
    props.$active
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.medium};
  color: ${(props) => (props.$active ? theme.colors.accent : "#666")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.accent};
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const MenuCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MenuImage = styled.div`
  font-size: 60px;
  margin-bottom: ${theme.spacing.sm};
`;

const MenuInfo = styled.div`
  text-align: center;
`;

const MenuName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: #666;
  margin-bottom: 4px;
`;

const MenuPrice = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
`;

const RestaurantSection = styled.section`
  margin-bottom: ${theme.spacing.lg};
`;

const RestaurantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const RestaurantCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
`;

const RestaurantIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fff3e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;

const RestaurantInfo = styled.div`
  flex: 1;
`;

const RestaurantName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin-bottom: 4px;
`;

const RestaurantTag = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #999;
`;

export default HomePage;
