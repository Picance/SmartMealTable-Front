import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiHeart, FiInfo } from "react-icons/fi";
import { IoHeartSharp } from "react-icons/io5";
import { storeService } from "../../services/store.service";
import {
  budgetService,
  type BudgetStatus,
} from "../../services/budget.service";
import { useCartStore } from "../../store/cartStore";
import type { StoreDetail, Menu } from "../../types/api";
import BottomNav from "../../components/layout/BottomNav";

const StoreDetailPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { items, fetchCart } = useCartStore();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [recommendedMenus, setRecommendedMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (storeId) {
      loadStoreData(parseInt(storeId));
    }
  }, [storeId]);

  // 컴포넌트 마운트 및 페이지 재진입 시 장바구니 동기화
  useEffect(() => {
    console.log("� [StoreDetailPage] 장바구니 상태 동기화");
    fetchCart();
    loadBudgetStatus(); // 예산 정보도 함께 로드
  }, []); // fetchCart는 stable하므로 deps에서 제외

  useEffect(() => {
    console.log("[StoreDetailPage] Cart items changed:", items.length);
  }, [items]);

  const loadBudgetStatus = async () => {
    try {
      // 오늘 날짜 가져오기
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const response = await budgetService.getDailyBudget(dateString);
      if (response.result === "SUCCESS" && response.data) {
        console.log("[StoreDetailPage] Daily budget loaded:", response.data);

        // DailyBudgetResponse를 BudgetStatus 형식으로 변환
        const dailyData = response.data;
        const budgetStatusData: BudgetStatus = {
          monthlyBudget: 0,
          monthlySpent: 0,
          monthlyRemaining: 0,
          dailyBudget: dailyData.totalBudget,
          dailySpent: dailyData.totalSpent,
          dailyRemaining: dailyData.remainingBudget,
          mealBudgets: {
            BREAKFAST: {
              budget: 0,
              spent: 0,
              remaining: 0,
            },
            LUNCH: {
              budget: 0,
              spent: 0,
              remaining: 0,
            },
            DINNER: {
              budget: 0,
              spent: 0,
              remaining: 0,
            },
          },
        };

        // mealBudgets 데이터 매핑
        dailyData.mealBudgets.forEach((meal) => {
          if (
            meal.mealType === "BREAKFAST" ||
            meal.mealType === "LUNCH" ||
            meal.mealType === "DINNER"
          ) {
            budgetStatusData.mealBudgets[meal.mealType] = {
              budget: meal.budget,
              spent: meal.spent,
              remaining: meal.remaining,
            };
          }
        });

        setBudgetStatus(budgetStatusData);
      }
    } catch (error) {
      console.error("[StoreDetailPage] Failed to load budget status:", error);
      // 404 에러는 예산이 설정되지 않은 것이므로 조용히 무시
    }
  };

  const loadStoreData = async (id: number) => {
    setLoading(true);

    try {
      let menusLoaded = false;
      let loadedMenus: Menu[] = [];

      // 가게 상세 정보 로드
      const storeResponse = await storeService.getStoreDetail(id);

      if (storeResponse.result === "SUCCESS" && storeResponse.data) {
        // API 응답 필드명 정규화
        const normalizedData = {
          ...storeResponse.data,
          storeName: storeResponse.data.name || storeResponse.data.storeName,
          category:
            storeResponse.data.categoryName ||
            storeResponse.data.category ||
            "기타",
        };

        setStore(normalizedData);
        setIsFavorite(normalizedData.isFavorite || false);

        // 가게 상세에서 메뉴 가져오기
        if (normalizedData.menus && normalizedData.menus.length > 0) {
          loadedMenus = normalizedData.menus;
          menusLoaded = true;
        } else if (
          normalizedData.recommendedMenus &&
          normalizedData.recommendedMenus.length > 0
        ) {
          // API 명세의 recommendedMenus 필드 사용
          loadedMenus = normalizedData.recommendedMenus;
          menusLoaded = true;
        }
      }

      // 가게 상세에 메뉴가 없으면 별도 메뉴 API 호출
      if (!menusLoaded) {
        try {
          const menusResponse = await storeService.getStoreMenus(id);

          if (menusResponse.result === "SUCCESS" && menusResponse.data) {
            loadedMenus = menusResponse.data.foods || [];
            menusLoaded = loadedMenus.length > 0;
          }
        } catch (menuError: any) {
          // 메뉴 API 호출 실패 시 무시
        }
      }

      // 메뉴가 로드되었으면 상태 업데이트
      if (menusLoaded && loadedMenus.length > 0) {
        setRecommendedMenus(
          loadedMenus.filter((m) => m.isRecommended).slice(0, 2)
        );
        setAllMenus(loadedMenus);
      } else {
        // 메뉴가 없으면 빈 배열로 설정
        setRecommendedMenus([]);
        setAllMenus([]);
      }
    } catch (error: any) {
      // 에러 발생 시에도 빈 배열로 설정
      setRecommendedMenus([]);
      setAllMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!store) return;

    try {
      if (isFavorite) {
        await storeService.removeFavoriteByStoreId(store.storeId);
      } else {
        await storeService.addFavorite(store.storeId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      alert("즐겨찾기 변경에 실패했습니다.");
    }
  };

  const handleMenuClick = (menu: Menu) => {
    if (!store) return;

    // 메뉴 상세 페이지로 이동
    navigate(`/menu/${menu.foodId}`, {
      state: {
        menu: menu,
        storeName: store.storeName || store.name,
        storeId: store.storeId,
      },
    });
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.totalPrice || item.subtotal || 0;
      return sum + itemTotal;
    }, 0);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!store) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorText>가게 정보를 불러올 수 없습니다.</ErrorText>
          <ErrorButton onClick={() => navigate(-1)}>돌아가기</ErrorButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 상단 이미지 헤더 - 와이어프레임 스타일 */}
      <StoreImageHeader>
        <StoreImage
          src={store.imageUrl || "/placeholder-store.jpg"}
          alt={store.storeName || store.name || "가게"}
        />
        <StoreHeaderOverlay>
          <StoreHeaderContent>
            <StoreName>
              {store.storeName || store.name || "가게명 없음"}
            </StoreName>
            <StoreMetaRow>
              <MetaText>
                {store.category || store.categoryName || "기타"}
              </MetaText>
              <MetaSeparator>•</MetaSeparator>
              <MetaText>
                {store.distance
                  ? `${(store.distance / 1000).toFixed(1)} km`
                  : "0.8 km"}
              </MetaText>
            </StoreMetaRow>
            <StoreBadgeRow>
              <PriceBadge>
                평균 {store.averagePrice.toLocaleString()}원
              </PriceBadge>
              <StatusBadge $isOpen={store.isOpen}>
                {store.isOpen ? "영업 중" : "영업 종료"}
              </StatusBadge>
            </StoreBadgeRow>
            <PopularityBadge>
              <BadgeIcon>🔥</BadgeIcon>
              <BadgeText>
                배달 인기 맛집 ({store.reviewCount || 1250} 리뷰)
              </BadgeText>
            </PopularityBadge>
            <InfoButton onClick={() => setShowInfoModal(true)}>
              <FiInfo size={18} />
              <InfoButtonText>정보</InfoButtonText>
            </InfoButton>
          </StoreHeaderContent>
          <FavoriteButton
            onClick={handleFavoriteToggle}
            $isFavorite={isFavorite}
          >
            {isFavorite ? <IoHeartSharp size={24} /> : <FiHeart size={24} />}
          </FavoriteButton>
        </StoreHeaderOverlay>
      </StoreImageHeader>

      {/* 가게 정보 */}
      <Content>
        {/* 추천 메뉴 - 데이터가 있을 때만 표시 */}
        {recommendedMenus.length > 0 && (
          <MenuSection>
            <SectionTitle>추천 메뉴</SectionTitle>
            <RecommendedMenuGrid>
              {recommendedMenus.map((menu) => (
                <RecommendedMenuCard
                  key={menu.foodId}
                  onClick={() => handleMenuClick(menu)}
                >
                  <MenuImage
                    src={menu.imageUrl || "/placeholder-menu.jpg"}
                    alt={menu.foodName}
                  />
                  <RecommendedMenuInfo>
                    <MenuName>{menu.foodName}</MenuName>
                    <MenuPriceRow>
                      <MenuPrice>₩{menu.price.toLocaleString()}</MenuPrice>
                      {menu.budgetDifference && (
                        <BudgetBadge $isPositive={menu.budgetDifference > 0}>
                          +₩{Math.abs(menu.budgetDifference).toLocaleString()}
                        </BudgetBadge>
                      )}
                    </MenuPriceRow>
                    <MenuDescription>
                      {menu.description ||
                        "고소한 치즈가 듬뿍 들어간 인기 메뉴입니다."}
                    </MenuDescription>
                  </RecommendedMenuInfo>
                </RecommendedMenuCard>
              ))}
            </RecommendedMenuGrid>
          </MenuSection>
        )}

        {/* 전체 메뉴 */}
        <MenuSection>
          <SectionTitle>전체 메뉴</SectionTitle>
          <AllMenuList>
            {allMenus.length === 0 ? (
              <NoMenuContainer>
                <NoMenuIcon>🍽️</NoMenuIcon>
                <NoMenuTitle>등록된 메뉴가 없습니다</NoMenuTitle>
                <NoMenuDescription>
                  현재 이 가게의 메뉴 정보를 준비중입니다.
                  <br />
                  빠른 시일 내에 업데이트하겠습니다.
                </NoMenuDescription>
              </NoMenuContainer>
            ) : (
              allMenus.map((menu) => (
                <MenuListItem
                  key={menu.foodId}
                  onClick={() => handleMenuClick(menu)}
                >
                  <MenuListImage
                    src={menu.imageUrl || "/placeholder-menu.jpg"}
                    alt={menu.foodName}
                  />
                  <MenuListInfo>
                    <MenuListName>{menu.foodName}</MenuListName>
                    <MenuListPriceRow>
                      <MenuListPrice>
                        ₩{menu.price.toLocaleString()}
                      </MenuListPrice>
                      {menu.budgetDifference && (
                        <BudgetBadge $isPositive={menu.budgetDifference > 0}>
                          {menu.budgetDifference > 0 ? "+" : "-"}₩
                          {Math.abs(menu.budgetDifference).toLocaleString()}
                        </BudgetBadge>
                      )}
                    </MenuListPriceRow>
                    {menu.description && (
                      <MenuListDescription>
                        {menu.description}
                      </MenuListDescription>
                    )}
                  </MenuListInfo>
                </MenuListItem>
              ))
            )}
          </AllMenuList>
        </MenuSection>
      </Content>

      {/* 장바구니 하단 바 */}
      {items.length > 0 && (
        <CartBottomBar>
          <CartSummary>
            <CartSummaryRow>
              <CartSummaryLabel>현재 장바구니 합계:</CartSummaryLabel>
              <CartSummaryValue>
                ₩{getTotalAmount().toLocaleString()}
              </CartSummaryValue>
            </CartSummaryRow>
            {budgetStatus && (
              <>
                <CartSummaryRow>
                  <CartSummaryLabel $strikethrough>
                    남은 일일 식비:
                  </CartSummaryLabel>
                  <CartSummaryValue $strikethrough>
                    ₩{budgetStatus.dailyRemaining.toLocaleString()}
                  </CartSummaryValue>
                </CartSummaryRow>
                {getTotalAmount() > budgetStatus.dailyRemaining && (
                  <CartSummaryRow>
                    <CartSummaryLabel $warning>예산 초과:</CartSummaryLabel>
                    <CartSummaryValue $warning>
                      ₩
                      {(
                        getTotalAmount() - budgetStatus.dailyRemaining
                      ).toLocaleString()}
                    </CartSummaryValue>
                  </CartSummaryRow>
                )}
              </>
            )}
            <CartDivider />
            <CartSummaryRow $bold>
              <CartSummaryLabel $bold>현재 장바구니 합계:</CartSummaryLabel>
              <CartSummaryValue $bold>
                ₩{getTotalAmount().toLocaleString()}
              </CartSummaryValue>
            </CartSummaryRow>
          </CartSummary>
          <CartButton onClick={() => navigate("/cart")}>
            장바구니 보기
          </CartButton>
        </CartBottomBar>
      )}

      {/* 매장 상세 정보 모달 */}
      {showInfoModal && store && (
        <StoreInfoModal store={store} onClose={() => setShowInfoModal(false)} />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab="recommendation" />
    </PageContainer>
  );
};

// 매장 상세 정보 모달 컴포넌트
interface StoreInfoModalProps {
  store: StoreDetail;
  onClose: () => void;
}

const StoreInfoModal = ({ store, onClose }: StoreInfoModalProps) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(store.address);
    alert("주소가 복사되었습니다.");
  };

  const handleCall = () => {
    const phoneNumber = store.phoneNumber || store.phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleDirections = () => {
    // 네이버 지도 앱으로 길찾기
    const lat = store.location?.latitude || store.latitude || 37.5665;
    const lng = store.location?.longitude || store.longitude || 126.978;
    const storeName = store.storeName || store.name || "매장";
    const naverMapUrl = `nmap://place?lat=${lat}&lng=${lng}&name=${encodeURIComponent(
      storeName
    )}&appname=com.smartmealtable`;
    window.location.href = naverMapUrl;
  };

  // openingHours 또는 operatingHours 사용
  const hours = store.openingHours || store.operatingHours || [];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>매장 상세 정보</ModalTitle>
        </ModalHeader>

        <ModalContent>
          <InfoSectionTitle>매장정보</InfoSectionTitle>

          {/* 지도 영역 */}
          <MapPlaceholder>
            <MapIcon>📍</MapIcon>
            <MapShop>🏪</MapShop>
          </MapPlaceholder>

          {/* 매장명 및 주소 */}
          <StoreInfoCard>
            <StoreTitleRow>
              <StoreTitle>{store.storeName || store.name}</StoreTitle>
            </StoreTitleRow>
            <AddressRow>
              <AddressText>{store.address}</AddressText>
              <CopyButton onClick={handleCopyAddress}>
                <CopyIcon>📋</CopyIcon>
                <span>주소복사</span>
              </CopyButton>
            </AddressRow>
            <LocationTag>(공릉로)</LocationTag>
          </StoreInfoCard>

          {/* 영업시간 */}
          <BusinessHoursSection>
            <BusinessHoursTitle>영업시간</BusinessHoursTitle>
            {hours && hours.length > 0 ? (
              hours.map((hour, index) => (
                <BusinessHourRow key={index}>
                  <DayLabel>{hour.dayOfWeek}:</DayLabel>
                  <TimeText>
                    {hour.isHoliday
                      ? "휴무"
                      : `${hour.openTime} ~ ${hour.closeTime}${
                          hour.breakStartTime && hour.breakEndTime
                            ? ` (브레이크타임: ${hour.breakStartTime} ~ ${hour.breakEndTime})`
                            : ""
                        }`}
                  </TimeText>
                </BusinessHourRow>
              ))
            ) : (
              <>
                <BusinessHourRow>
                  <DayLabel>월요일:</DayLabel>
                  <TimeText>0:00 ~ 0:30, 12:00 ~ 24:00</TimeText>
                </BusinessHourRow>
                <BusinessHourRow>
                  <DayLabel>화요일:</DayLabel>
                  <TimeText>0:00 ~ 1:30, 12:00 ~ 24:00</TimeText>
                </BusinessHourRow>
                <BusinessHourRow>
                  <DayLabel>수요일:</DayLabel>
                  <TimeText>0:00 ~ 1:00, 12:00 ~ 24:00</TimeText>
                </BusinessHourRow>
                <BusinessHourRow>
                  <DayLabel>목요일 ~ 금요일:</DayLabel>
                  <TimeText>0:00 ~ 1:30, 12:00 ~ 24:00</TimeText>
                </BusinessHourRow>
                <BusinessHourRow>
                  <DayLabel>토요일 ~ 일요일:</DayLabel>
                  <TimeText>0:00 ~ 2:30, 12:00 ~ 24:00</TimeText>
                </BusinessHourRow>
              </>
            )}
          </BusinessHoursSection>

          {/* 액션 버튼 */}
          <ActionButtons>
            <CallButton onClick={handleCall}>
              <ButtonIcon>📞</ButtonIcon>
              <span>전화 걸기</span>
            </CallButton>
            <DirectionsButton onClick={handleDirections}>
              <ButtonIcon>🗺️</ButtonIcon>
              <span>길찾기</span>
            </DirectionsButton>
          </ActionButtons>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  padding-bottom: 80px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  font-size: 14px;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
`;

const ErrorButton = styled.button`
  padding: 12px 24px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #ff5722;
  }
`;

const StoreImageHeader = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  background-color: #f5f5f5;
`;

const StoreImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoreHeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
`;

const StoreHeaderContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding-bottom: 8px;
`;

const FavoriteButton = styled.button<{ $isFavorite: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props) => (props.$isFavorite ? "#ff6b35" : "#666")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
    background-color: rgba(255, 255, 255, 1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Content = styled.div`
  padding: 0 0 120px 0;
`;

const StoreName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const StoreMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const MetaText = styled.span`
  font-size: 14px;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const MetaSeparator = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const StoreBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const PriceBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 13px;
  font-weight: 600;
  border-radius: 12px;
`;

const StatusBadge = styled.span<{ $isOpen: boolean }>`
  display: inline-block;
  padding: 4px 10px;
  background-color: ${(props) => (props.$isOpen ? "#ff6b35" : "#666")};
  color: white;
  font-size: 13px;
  font-weight: 600;
  border-radius: 12px;
`;

const PopularityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
`;

const BadgeIcon = styled.span`
  font-size: 16px;
`;

const BadgeText = styled.span`
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const InfoButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;

  &:hover {
    background-color: rgba(255, 255, 255, 1);
  }
`;

const InfoButtonText = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const MenuSection = styled.section`
  padding: 24px 0;
  background-color: #ffffff;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px 0;
  padding: 0 16px;
`;

const RecommendedMenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 0 16px;
`;

const RecommendedMenuCard = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const MenuImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 12px;
`;

const RecommendedMenuInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MenuName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #000;
`;

const MenuPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MenuPrice = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #ff6b35;
`;

const BudgetBadge = styled.span<{ $isPositive: boolean }>`
  display: inline-block;
  padding: 3px 8px;
  background-color: ${(props) =>
    props.$isPositive ? "rgba(255, 107, 53, 0.15)" : "#e5f5ff"};
  color: ${(props) => (props.$isPositive ? "#ff6b35" : "#0066ff")};
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
`;

const MenuDescription = styled.p`
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const AllMenuList = styled.div`
  padding: 0 16px;
`;

const NoMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const NoMenuIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const NoMenuTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
`;

const NoMenuDescription = styled.p`
  font-size: 14px;
  color: #999;
  line-height: 1.6;
  margin: 0;
`;

const MenuListItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fafafa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MenuListImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
`;

const MenuListInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MenuListName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #000;
`;

const MenuListPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MenuListPrice = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #ff6b35;
`;

const MenuListDescription = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CartBottomBar = styled.div`
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #e5e5e5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  z-index: 50;

  @media (min-width: 431px) {
    max-width: 430px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const CartSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CartSummaryRow = styled.div<{ $bold?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CartSummaryLabel = styled.span<{
  $bold?: boolean;
  $strikethrough?: boolean;
  $warning?: boolean;
}>`
  font-size: ${(props) => (props.$bold ? "15px" : "13px")};
  color: ${(props) => {
    if (props.$warning) return "#ff4444";
    if (props.$strikethrough) return "#999";
    if (props.$bold) return "#000";
    return "#666";
  }};
  font-weight: ${(props) => (props.$bold ? "700" : "400")};
  text-decoration: ${(props) =>
    props.$strikethrough ? "line-through" : "none"};
`;

const CartSummaryValue = styled.span<{
  $bold?: boolean;
  $strikethrough?: boolean;
  $warning?: boolean;
}>`
  font-size: ${(props) => (props.$bold ? "18px" : "14px")};
  color: ${(props) => {
    if (props.$warning) return "#ff4444";
    if (props.$strikethrough) return "#999";
    if (props.$bold) return "#000";
    return "#000";
  }};
  font-weight: ${(props) => (props.$bold ? "700" : "600")};
  text-decoration: ${(props) =>
    props.$strikethrough ? "line-through" : "none"};
`;

const CartDivider = styled.div`
  height: 1px;
  background-color: #e5e5e5;
  margin: 8px 0;
`;

const CartButton = styled.button`
  width: 100%;
  padding: 18px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// 모달 Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: 430px;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  background-color: #333;
  padding: 16px 20px;
  text-align: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const ModalContent = styled.div`
  padding: 24px 20px;
  overflow-y: auto;
  max-height: calc(90vh - 60px);
`;

const InfoSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 20px 0;
  text-align: center;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(to bottom, #e3f2fd, #f5f5f5);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
`;

const MapIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const MapShop = styled.div`
  font-size: 32px;
  position: absolute;
  bottom: 60px;
`;

const StoreInfoCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px 0;
  margin-bottom: 24px;
`;

const StoreTitleRow = styled.div`
  margin-bottom: 12px;
`;

const StoreTitle = styled.h4`
  font-size: 20px;
  font-weight: 700;
  color: #000;
  margin: 0;
`;

const AddressRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AddressText = styled.span`
  font-size: 14px;
  color: #666;
  flex: 1;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: transparent;
  border: none;
  color: #ff6b35;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const CopyIcon = styled.span`
  font-size: 16px;
`;

const LocationTag = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
`;

const BusinessHoursSection = styled.div`
  margin-bottom: 24px;
`;

const BusinessHoursTitle = styled.h5`
  font-size: 16px;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px 0;
`;

const BusinessHourRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DayLabel = styled.span`
  min-width: 140px;
  color: #333;
  font-weight: 500;
`;

const TimeText = styled.span`
  color: #666;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const CallButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const DirectionsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: #ffd54f;
  color: #000;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ffc107;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ButtonIcon = styled.span`
  font-size: 20px;
`;

export default StoreDetailPage;
