import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import {
  FiChevronDown,
  FiCompass,
  FiFileText,
  FiHeart,
  FiHome,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import { PiBowlFoodFill, PiStorefrontFill } from "react-icons/pi";
import {
  getHomeDashboard,
  getOnboardingStatus,
  confirmMonthlyBudget,
} from "../../services/home.service";
import { useAuthStore } from "../../store/authStore";
import type {
  HomeDashboardResponse,
  OnboardingStatusResponse,
} from "../../types/api";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [dashboardData, setDashboardData] =
    useState<HomeDashboardResponse | null>(null);
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // 로그인 체크
  useEffect(() => {
    console.log("[HomePage] 인증 상태:", {
      isAuthenticated,
      hasToken: !!accessToken,
    });

    if (!isAuthenticated || !accessToken) {
      console.warn("[HomePage] 로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
      return;
    }
  }, [isAuthenticated, accessToken, navigate]);

  // 데이터 로드
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadHomeData();
    }
  }, [isAuthenticated, accessToken]);

  const loadHomeData = async () => {
    svg {
      width: 32px;
      height: 32px;
    }
        console.log("[HomePage] Dashboard Data:", dashboardResponse.data);
        setDashboardData(dashboardResponse.data);
      } else if (dashboardResponse.error?.code === "ADDRESS_002") {
        // 주소가 없는 경우
        setError("등록된 주소가 없습니다. 주소를 먼저 등록해주세요.");
        // 주소 등록 화면으로 이동
        navigate("/onboarding/address");
        return;
      } else {
        console.error("[HomePage] Dashboard Response Error:", dashboardResponse.error);
        setError(
          dashboardResponse.error?.message ||
            "대시보드 데이터를 불러올 수 없습니다."
        );
        return;
      }

      // 온보딩 상태 확인
      const statusResponse = await getOnboardingStatus();
      console.log("[HomePage] Onboarding Status Response:", statusResponse);

      if (statusResponse.result === "SUCCESS" && statusResponse.data) {
        setOnboardingStatus(statusResponse.data);

        // 월별 예산 모달 표시 여부 확인
        if (statusResponse.data.showMonthlyBudgetModal) {
          setShowBudgetModal(true);
        }
      }
    } catch (err: any) {
      console.error("[HomePage] 홈 데이터 로드 실패:", err);
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
      </Container>
    );
  }

  if (error || !dashboardData) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>{error || "데이터를 불러올 수 없습니다."}</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  const { location, budget, recommendedMenus, recommendedStores } =
    dashboardData;

  // 데이터 유효성 검증
  if (!location || !budget) {
    console.error("[HomePage] Invalid dashboard data structure:", dashboardData);
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>데이터 구조가 올바르지 않습니다.</ErrorText>
        </ErrorContainer>
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
          <MenuGrid>
            {recommendedMenus && recommendedMenus.length > 0 ? (
              recommendedMenus.map((menu) => (
                <MenuCard
                  key={menu.foodId}
                  onClick={() => {
                    // storeId가 있으면 가게 상세 페이지로, 없으면 메뉴 상세 페이지로 이동
                    if (menu.storeId) {
                      navigate(`/store/${menu.storeId}`);
                    } else {
                      navigate(`/menu/${menu.foodId}`);
                    }
                  }}
                >
                  <MenuImage>
                    {menu.imageUrl ? (
                      <img src={menu.imageUrl} alt={menu.foodName || "메뉴"} />
                    ) : (
                      <ImagePlaceholder>
                        <PiBowlFoodFill />
                      </ImagePlaceholder>
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
                      <ImagePlaceholder>
                        <PiStorefrontFill />
                      </ImagePlaceholder>
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

      {/* 위치 정보를 전달하는 커스텀 BottomNav */}
      <CustomBottomNav>
        <NavItem onClick={() => navigate("/home")} $active={true}>
          <NavIcon>
            <FiHome />
          </NavIcon>
          <NavLabel $active={true}>홈</NavLabel>
        </NavItem>
        <NavItem onClick={() => navigate("/spending")} $active={false}>
          <NavIcon>
            <FiFileText />
          </NavIcon>
          <NavLabel $active={false}>지출 내역</NavLabel>
        </NavItem>
        <NavItem
          onClick={() =>
            navigate("/recommendation", {
              state: {
                userLocation: location
                  ? {
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }
                  : null,
              },
            })
          }
          $active={false}
        >
          <NavIcon>
            <FiCompass />
          </NavIcon>
          <NavLabel $active={false}>음식 추천</NavLabel>
        </NavItem>
        <NavItem onClick={() => navigate("/favorites")} $active={false}>
          <NavIcon>
            <FiHeart />
          </NavIcon>
          <NavLabel $active={false}>즐겨 찾는 가게</NavLabel>
        </NavItem>
        <NavItem onClick={() => navigate("/profile")} $active={false}>
          <NavIcon>
            <FiUser />
          </NavIcon>
          <NavLabel $active={false}>프로필</NavLabel>
        </NavItem>
      </CustomBottomNav>
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
  
  svg {
    width: 32px;
    height: 32px;
  }
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

// 커스텀 BottomNav 스타일
const CustomBottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: ${theme.spacing.sm} 0;
  z-index: 100;

  @media (min-width: 431px) {
    max-width: 430px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const NavItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const NavIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const NavLabel = styled.span<{ $active?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${(props) => (props.$active ? theme.colors.accent : "#757575")};
  font-weight: ${(props) =>
    props.$active
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal};
`;

export default HomePage;
