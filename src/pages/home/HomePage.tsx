import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronDown, FiMapPin } from "react-icons/fi";
import BottomNav from "../../components/layout/BottomNav";
import {
  getHomeDashboard,
  getOnboardingStatus,
  confirmMonthlyBudget,
} from "../../services/home.service";
import type {
  HomeDashboardResponse,
  OnboardingStatusResponse,
} from "../../types/api";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"popular" | "healthy">("popular");
  const [dashboardData, setDashboardData] =
    useState<HomeDashboardResponse | null>(null);
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 홈 대시보드 데이터 로드
      const dashboardResponse = await getHomeDashboard();
      console.log("📊 Dashboard Response:", dashboardResponse);

      if (dashboardResponse.result === "SUCCESS" && dashboardResponse.data) {
        console.log("✅ Dashboard Data:", dashboardResponse.data);
        setDashboardData(dashboardResponse.data);
      } else if (dashboardResponse.error?.code === "ADDRESS_002") {
        // 주소가 없는 경우
        setError("등록된 주소가 없습니다. 주소를 먼저 등록해주세요.");
        // 주소 등록 화면으로 이동
        navigate("/onboarding/address");
        return;
      } else {
        console.error("❌ Dashboard Response Error:", dashboardResponse.error);
        setError(
          dashboardResponse.error?.message ||
            "대시보드 데이터를 불러올 수 없습니다."
        );
        return;
      }

      // 온보딩 상태 확인
      const statusResponse = await getOnboardingStatus();
      console.log("📋 Onboarding Status Response:", statusResponse);

      if (statusResponse.result === "SUCCESS" && statusResponse.data) {
        setOnboardingStatus(statusResponse.data);

        // 월별 예산 모달 표시 여부 확인
        if (statusResponse.data.showMonthlyBudgetModal) {
          setShowBudgetModal(true);
        }
      }
    } catch (err: any) {
      console.error("❌ 홈 데이터 로드 실패:", err);
      console.error("Error details:", err.response?.data);
      setError(
        err.response?.data?.error?.message ||
          "데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetConfirm = async (action: "KEEP" | "CHANGE") => {
    if (!onboardingStatus) return;

    if (action === "CHANGE") {
      navigate("/profile/budget");
      return;
    }

    try {
      const [year, month] = onboardingStatus.currentMonth
        .split("-")
        .map(Number);
      await confirmMonthlyBudget({
        year,
        month,
        action: "KEEP",
      });
      setShowBudgetModal(false);
    } catch (err) {
      console.error("예산 확인 처리 실패:", err);
    }
  };

  const handleLocationClick = () => {
    navigate("/address/management");
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
        <BottomNav activeTab="home" />
      </Container>
    );
  }

  if (error || !dashboardData) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>{error || "데이터를 불러올 수 없습니다."}</ErrorText>
        </ErrorContainer>
        <BottomNav activeTab="home" />
      </Container>
    );
  }

  const { location, budget, recommendedMenus, recommendedStores } =
    dashboardData;

  // 데이터 유효성 검증
  if (!location || !budget) {
    console.error("❌ Invalid dashboard data structure:", dashboardData);
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>데이터 구조가 올바르지 않습니다.</ErrorText>
        </ErrorContainer>
        <BottomNav activeTab="home" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Logo>알뜰식탁</Logo>
        <LocationButton onClick={handleLocationClick}>
          <FiMapPin size={16} />
          <span>
            {location?.addressAlias || "위치"}:{" "}
            {location?.roadAddress || "주소 없음"}
          </span>
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
              <BudgetAmount>
                {(budget?.todaySpent || 0).toLocaleString()}원
              </BudgetAmount>
              <ProgressBar>
                <ProgressFill
                  $percentage={
                    (budget?.todayBudget || 0) > 0
                      ? ((budget?.todaySpent || 0) /
                          (budget?.todayBudget || 1)) *
                        100
                      : 0
                  }
                />
              </ProgressBar>
            </BudgetCard>
            <BudgetCard>
              <BudgetLabel>남은 식비</BudgetLabel>
              <BudgetAmount $isNegative={(budget?.remaining || 0) < 0}>
                {(budget?.remaining || 0).toLocaleString()}원
              </BudgetAmount>
              <BudgetSubtext>
                오늘 예산: {(budget?.todayBudget || 0).toLocaleString()}원
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
            {recommendedMenus && recommendedMenus.length > 0 ? (
              recommendedMenus.map((menu) => (
                <MenuCard
                  key={menu.foodId}
                  onClick={() => navigate(`/menu/${menu.foodId}`)}
                >
                  <MenuImage>
                    {menu.imageUrl ? (
                      <img src={menu.imageUrl} alt={menu.foodName || "메뉴"} />
                    ) : (
                      <ImagePlaceholder>🍽️</ImagePlaceholder>
                    )}
                  </MenuImage>
                  <MenuInfo>
                    <MenuName>{menu.foodName || "메뉴명 없음"}</MenuName>
                    <MenuStoreName>
                      {menu.storeName || "식당명 없음"}
                    </MenuStoreName>
                    <MenuPrice>
                      {(menu.price || 0).toLocaleString()}원
                    </MenuPrice>
                    <MenuTags>
                      {menu.tags &&
                        menu.tags.map((tag, idx) => (
                          <MenuTag key={idx}>{tag}</MenuTag>
                        ))}
                    </MenuTags>
                  </MenuInfo>
                </MenuCard>
              ))
            ) : (
              <EmptyMessage>추천 메뉴가 없습니다.</EmptyMessage>
            )}
          </MenuGrid>
        </RecommendSection>

        {/* 식사 추천 */}
        <RestaurantSection>
          <SectionTitle>식사 추천</SectionTitle>
          <RestaurantList>
            {recommendedStores && recommendedStores.length > 0 ? (
              recommendedStores.map((store) => (
                <RestaurantCard
                  key={store.storeId}
                  onClick={() => navigate(`/store/${store.storeId}`)}
                >
                  <RestaurantIcon>
                    {store.imageUrl ? (
                      <img
                        src={store.imageUrl}
                        alt={store.storeName || "식당"}
                      />
                    ) : (
                      <ImagePlaceholder>🏪</ImagePlaceholder>
                    )}
                  </RestaurantIcon>
                  <RestaurantInfo>
                    <RestaurantName>
                      {store.storeName || "식당명 없음"}
                    </RestaurantName>
                    <RestaurantDetails>
                      {store.categoryName || "카테고리"} ·{" "}
                      {store.distanceText || "거리 정보 없음"}
                    </RestaurantDetails>
                    <RestaurantTag>{store.contextInfo || ""}</RestaurantTag>
                    <RestaurantPrice>
                      평균 {(store.averagePrice || 0).toLocaleString()}원
                    </RestaurantPrice>
                  </RestaurantInfo>
                </RestaurantCard>
              ))
            ) : (
              <EmptyMessage>추천 식당이 없습니다.</EmptyMessage>
            )}
          </RestaurantList>
        </RestaurantSection>
      </Content>

      {/* 월별 예산 확인 모달 */}
      {showBudgetModal && onboardingStatus && (
        <ModalOverlay onClick={() => setShowBudgetModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>이번 달 예산 확인</ModalTitle>
            <ModalMessage>
              {onboardingStatus.currentMonth} 예산을 확인해주세요.
              <br />
              기존 예산을 유지하시겠습니까?
            </ModalMessage>
            <ModalButtons>
              <ModalButton onClick={() => handleBudgetConfirm("KEEP")}>
                기존 유지
              </ModalButton>
              <ModalButton
                $primary
                onClick={() => handleBudgetConfirm("CHANGE")}
              >
                변경하기
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}

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

const BudgetAmount = styled.div<{ $isNegative?: boolean }>`
  font-size: 24px;
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${(props) => (props.$isNegative ? "#e53935" : "#212121")};
  margin-bottom: 4px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background-color: ${(props) =>
    props.$percentage > 100
      ? "#e53935"
      : props.$percentage > 80
      ? "#ffa726"
      : theme.colors.accent};
  width: ${(props) => Math.min(props.$percentage, 100)}%;
  transition: width 0.3s ease;
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
  width: 100%;
  height: 120px;
  background-color: #f5f5f5;
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background-color: #f5f5f5;
`;

const MenuInfo = styled.div`
  text-align: center;
`;

const MenuName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin-bottom: 4px;
`;

const MenuStoreName = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: #999;
  margin-bottom: 4px;
`;

const MenuPrice = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent};
  margin-bottom: 6px;
`;

const MenuTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
`;

const MenuTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background-color: #fff3e0;
  color: ${theme.colors.accent};
  font-size: ${theme.typography.fontSize.xs};
  border-radius: 12px;
  font-weight: ${theme.typography.fontWeight.medium};
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
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

const RestaurantDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #666;
  margin-bottom: 4px;
`;

const RestaurantTag = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.accent};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: 4px;
`;

const RestaurantPrice = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: #999;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: #999;
  font-size: ${theme.typography.fontSize.base};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px);
`;

const LoadingText = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px);
  padding: ${theme.spacing.lg};
`;

const ErrorText = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.base};
  color: #e53935;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

const ModalMessage = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin-bottom: ${theme.spacing.xl};
`;

const ModalButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  border: ${(props) =>
    props.$primary ? "none" : `1px solid ${theme.colors.gray[300]}`};
  background-color: ${(props) =>
    props.$primary ? theme.colors.accent : "white"};
  color: ${(props) => (props.$primary ? "white" : "#666")};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export default HomePage;
