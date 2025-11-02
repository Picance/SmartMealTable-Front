import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  FiMapPin,
  FiBell,
  FiSettings,
  FiChevronRight,
  FiSunrise,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { budgetService, BudgetStatus } from "../../services/budget.service";
import { storeService, RecommendedStore } from "../../services/store.service";
import { recommendationService } from "../../services/recommendation.service";
import { BudgetCard } from "../../components/home/BudgetCard";
import { StoreCard } from "../../components/home/StoreCard";
import { MenuCard } from "../../components/home/MenuCard";
import type { RecommendedMenu } from "../../services/recommendation.service";

const HomePage = () => {
  const navigate = useNavigate();
  const member = useAuthStore((state) => state.member);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [recommendedMenus, setRecommendedMenus] = useState<RecommendedMenu[]>(
    []
  );
  const [recommendedStores, setRecommendedStores] = useState<
    RecommendedStore[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 병렬로 데이터 로드
      const [budgetRes, menusRes, storesRes] = await Promise.all([
        budgetService.getBudgetStatus(),
        recommendationService.getPersonalizedMenus({ limit: 10 }),
        storeService.getRecommendedStores(),
      ]);

      if (budgetRes.result === "SUCCESS" && budgetRes.data) {
        setBudgetStatus(budgetRes.data);
      }

      if (menusRes.result === "SUCCESS" && menusRes.data) {
        setRecommendedMenus(menusRes.data);
      }

      if (storesRes.result === "SUCCESS" && storesRes.data) {
        setRecommendedStores(storesRes.data);
      }
    } catch (err: any) {
      console.error("데이터 로드 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreClick = (storeId: number) => {
    navigate(`/store/${storeId}`);
  };

  const handleFavoriteToggle = async (storeId: number) => {
    try {
      const store = recommendedStores.find((s) => s.storeId === storeId);
      if (store?.isFavorite) {
        await storeService.removeFavorite(storeId);
      } else {
        await storeService.addFavorite(storeId);
      }
      // 목록 새로고침
      loadData();
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Spinner />
          <LoadingText>데이터를 불러오는 중...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <Greeting>
            안녕하세요,
            <br />
            <GreetingName>{member?.nickname || member?.name}님</GreetingName>
          </Greeting>
          <HeaderIcons>
            <IconButton onClick={() => navigate("/notifications")}>
              <FiBell />
            </IconButton>
            <IconButton onClick={() => navigate("/settings")}>
              <FiSettings />
            </IconButton>
          </HeaderIcons>
        </HeaderTop>
        <LocationButton onClick={() => navigate("/address")}>
          <FiMapPin />
          <span>현재 위치</span>
          <FiChevronRight style={{ fontSize: "0.75rem" }} />
        </LocationButton>
      </Header>

      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {budgetStatus && (
          <BudgetSection>
            <BudgetGrid>
              <BudgetCard
                title="오늘의 예산"
                budget={budgetStatus.dailyBudget}
                spent={budgetStatus.dailySpent}
                remaining={budgetStatus.dailyRemaining}
                variant="primary"
              />
            </BudgetGrid>

            <MealBudgets>
              <BudgetCard
                title="아침"
                budget={budgetStatus.mealBudgets.BREAKFAST.budget}
                spent={budgetStatus.mealBudgets.BREAKFAST.spent}
                remaining={budgetStatus.mealBudgets.BREAKFAST.remaining}
                icon={<FiSunrise />}
                variant="secondary"
              />
              <BudgetCard
                title="점심"
                budget={budgetStatus.mealBudgets.LUNCH.budget}
                spent={budgetStatus.mealBudgets.LUNCH.spent}
                remaining={budgetStatus.mealBudgets.LUNCH.remaining}
                icon={<FiSun />}
                variant="secondary"
              />
              <BudgetCard
                title="저녁"
                budget={budgetStatus.mealBudgets.DINNER.budget}
                spent={budgetStatus.mealBudgets.DINNER.spent}
                remaining={budgetStatus.mealBudgets.DINNER.remaining}
                icon={<FiMoon />}
                variant="secondary"
              />
            </MealBudgets>
          </BudgetSection>
        )}

        <Section>
          <SectionHeader>
            <SectionTitle>오늘의 추천 메뉴</SectionTitle>
            <SectionLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/recommendation");
              }}
            >
              전체보기 <FiChevronRight />
            </SectionLink>
          </SectionHeader>

          {recommendedMenus.length > 0 ? (
            <MenuScroll>
              {recommendedMenus.map((menu) => (
                <MenuCard
                  key={menu.menuId}
                  menuName={menu.menuName}
                  price={menu.price}
                  imageUrl={menu.imageUrl}
                  storeName={menu.storeName}
                  distance={menu.distance}
                  recommendationReason={menu.recommendationReason}
                  onClick={() => handleStoreClick(menu.storeId)}
                />
              ))}
            </MenuScroll>
          ) : (
            <EmptyState>
              <EmptyIcon>🍽️</EmptyIcon>
              <EmptyText>추천할 메뉴가 없습니다</EmptyText>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>근처 맛집</SectionTitle>
            <SectionLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/recommendation");
              }}
            >
              전체보기 <FiChevronRight />
            </SectionLink>
          </SectionHeader>

          {recommendedStores.length > 0 ? (
            <StoreGrid>
              {recommendedStores.slice(0, 6).map((store) => (
                <StoreCard
                  key={store.storeId}
                  store={store}
                  onClick={() => handleStoreClick(store.storeId)}
                  onFavoriteClick={() => handleFavoriteToggle(store.storeId)}
                />
              ))}
            </StoreGrid>
          ) : (
            <EmptyState>
              <EmptyIcon>🏪</EmptyIcon>
              <EmptyText>추천할 가게가 없습니다</EmptyText>
            </EmptyState>
          )}
        </Section>
      </Content>
    </PageContainer>
  );
};

// Styled Components
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background-color: ${(props) => props.theme.colors.background.secondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: ${(props) => props.theme.spacing.lg};
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${(props) => props.theme.colors.gray[200]};
  border-top-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.text.secondary};
`;

const Header = styled.div`
  background-color: ${(props) => props.theme.colors.background.primary};
  padding: ${(props) => props.theme.spacing["2xl"]}
    ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const Greeting = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.normal};
  color: ${(props) => props.theme.colors.text.primary};
  margin: 0;
  line-height: 1.3;
`;

const GreetingName = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.primary};
`;

const HeaderIcons = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.background.secondary};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props) => props.theme.colors.text.primary};
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray[200]};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text.tertiary};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.xs} 0;

  &:hover {
    color: ${(props) => props.theme.colors.text.primary};
  }
`;

const Content = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing["2xl"]};
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.base};
  text-align: center;
`;

const BudgetSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const BudgetGrid = styled.div`
  display: grid;
  gap: ${(props) => props.theme.spacing.lg};
`;

const MealBudgets = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(props) => props.theme.spacing.md};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.text.primary};
  margin: 0;
`;

const SectionLink = styled.a`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  text-decoration: none;
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};

  &:hover {
    text-decoration: underline;
  }
`;

const MenuScroll = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.lg};
  overflow-x: auto;
  padding-bottom: ${(props) => props.theme.spacing.sm};

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.gray[100]};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.gray[400]};
    border-radius: 3px;
  }

  & > * {
    flex: 0 0 280px;
  }
`;

const StoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing["3xl"]}
    ${(props) => props.theme.spacing.xl};
  gap: ${(props) => props.theme.spacing.lg};
`;

const EmptyIcon = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize["4xl"]};
`;

const EmptyText = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.text.tertiary};
  margin: 0;
`;

export default HomePage;
