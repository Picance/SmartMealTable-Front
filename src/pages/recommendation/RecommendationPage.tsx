import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiArrowLeft, FiSearch, FiSliders, FiChevronDown } from "react-icons/fi";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { storeService, StoreSearchParams } from "../../services/store.service";
import { categoryService } from "../../services/category.service";
import type { Store, Category } from "../../types/api";
import BottomNav from "../../components/layout/BottomNav";

type SortBy = "DISTANCE" | "PRICE" | "RATING" | "POPULARITY";

const RecommendationPage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("DISTANCE");
  const [stores, setStores] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    searchStores();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      searchStores();
    }
  }, [selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.result === "SUCCESS" && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("카테고리 로드 실패:", err);
    }
  };

  const searchStores = async () => {
    setIsLoading(true);

    try {
      const params: StoreSearchParams = {
        sortBy,
        page: 0,
        size: 20,
      };

      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      const response = await storeService.searchStores(params);

      if (response.result === "SUCCESS" && response.data) {
        setStores(response.data.content);
        setTotalCount(response.data.totalElements);
      } else {
        setStores([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error("가게 검색 실패:", err);
      // API 실패 시 테스트용 목 데이터 사용
      const mockStores: any[] = [
        {
          storeId: 1,
          storeName: "맛있는 치킨집",
          category: "치킨",
          categoryId: 1,
          distance: 0.3,
          reviewCount: 1200,
          averagePrice: 15000,
          isOpen: true,
          popularityTag: "영업중",
          imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=400&fit=crop",
          address: "서울시 서대문구",
          isFavorite: false,
          menus: [
            { foodId: 1, foodName: "후라이드 치킨", price: 18000, imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop" },
            { foodId: 2, foodName: "양념 치킨", price: 19000, imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop" },
            { foodId: 3, foodName: "마늘 간장 치킨", price: 19500, imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop" },
          ],
        },
        {
          storeId: 2,
          storeName: "맛있는 치킨집",
          category: "치킨",
          categoryId: 1,
          distance: 0.3,
          reviewCount: 1200,
          averagePrice: 15000,
          isOpen: true,
          popularityTag: "영업중",
          imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=400&fit=crop",
          address: "서울시 서대문구",
          isFavorite: true,
          menus: [
            { foodId: 4, foodName: "후라이드 치킨", price: 18000, imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop" },
            { foodId: 5, foodName: "양념 치킨", price: 19000, imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop" },
            { foodId: 6, foodName: "마늘 간장 치킨", price: 19500, imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop" },
          ],
        },
        {
          storeId: 3,
          storeName: "맛있는 치킨집",
          category: "치킨",
          categoryId: 1,
          distance: 0.3,
          reviewCount: 1200,
          averagePrice: 15000,
          isOpen: true,
          popularityTag: "영업중",
          imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=400&fit=crop",
          address: "서울시 서대문구",
          isFavorite: false,
          menus: [
            { foodId: 7, foodName: "후라이드 치킨", price: 18000, imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop" },
            { foodId: 8, foodName: "양념 치킨", price: 19000, imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop" },
            { foodId: 9, foodName: "마늘 간장 치킨", price: 19500, imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop" },
          ],
        },
      ];
      setStores(mockStores);
      setTotalCount(359);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchStores();
  };

  const handleStoreClick = (storeId: number) => {
    navigate(`/store/${storeId}`);
  };

  const handleFavoriteToggle = async (storeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const store = stores.find((s) => s.storeId === storeId);
      if (store?.isFavorite) {
        await storeService.removeFavorite(storeId);
      } else {
        await storeService.addFavorite(storeId);
      }
      setStores(stores.map(s => 
        s.storeId === storeId ? { ...s, isFavorite: !s.isFavorite } : s
      ));
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
    }
  };

  return (
    <PageContainer>
      {/* 상단 검색바 */}
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </BackButton>
        <SearchBox>
          <FiSearch size={18} color="#999" />
          <SearchInput
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="가게 또는 메뉴 검색"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </SearchBox>
        <FilterIconButton>
          <FiSliders size={20} />
        </FilterIconButton>
      </TopBar>

      {/* 필터 버튼들 */}
      <FilterBar>
        <FilterButton>
          <span>📍거리: 0.5km</span>
          <FiChevronDown size={14} />
        </FilterButton>
        <FilterButton>
          <span>🍽️음식: 모두</span>
          <FiChevronDown size={14} />
        </FilterButton>
        <FilterButton>
          <span>↕️정렬: 추천순</span>
          <FiChevronDown size={14} />
        </FilterButton>
      </FilterBar>

      {/* 필터 태그 */}
      <TagBar>
        <TagChip>정렬: 추천순</TagChip>
        <TagChip>거리: 0.5km</TagChip>
        <TagChip>물가대: 미로운</TagChip>
        <TagChip>영업중: 예</TagChip>
        <TagChip>음식: 모두</TagChip>
      </TagBar>

      {/* 결과 텍스트 */}
      <ResultHeader>
        <ResultCount>{totalCount}개 결과</ResultCount>
        <ResultKeyword>*우리이드 치킨*</ResultKeyword>
      </ResultHeader>

      {/* 상점 리스트 */}
      <StoreList>
        {isLoading ? (
          <LoadingText>로딩 중...</LoadingText>
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <StoreCard key={store.storeId} onClick={() => handleStoreClick(store.storeId)}>
              {/* 상점 메인 이미지 */}
              <StoreImageContainer>
                <StoreMainImage 
                  src={store.imageUrl} 
                  alt={store.storeName}
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x400?text=No+Image";
                  }}
                />
                <StoreNameOverlay>
                  <StoreName>{store.storeName}</StoreName>
                  <StoreLocation>{store.address}</StoreLocation>
                </StoreNameOverlay>
                <FavoriteButton onClick={(e) => handleFavoriteToggle(store.storeId, e)}>
                  {store.isFavorite ? (
                    <IoHeartSharp size={28} color="#fff" />
                  ) : (
                    <IoHeartOutline size={28} color="#fff" />
                  )}
                </FavoriteButton>
              </StoreImageContainer>

              {/* 상점 정보 */}
              <StoreInfoSection>
                <InfoRow>
                  <InfoItem>📍 {store.distance}km</InfoItem>
                  <InfoItem>💬 {store.reviewCount}개 리뷰</InfoItem>
                </InfoRow>
                
                <BadgeRow>
                  <StatusBadge $isOpen={store.isOpen}>
                    {store.popularityTag}
                  </StatusBadge>
                  <PriceInfo>
                    <PriceIcon>💰</PriceIcon>
                    {store.averagePrice.toLocaleString()}원
                  </PriceInfo>
                  <PopularityBadge>⚡ 매우 인기 많음</PopularityBadge>
                </BadgeRow>

                {/* 메뉴 그리드 */}
                {store.menus && store.menus.length > 0 && (
                  <MenuGrid>
                    {store.menus.slice(0, 3).map((menu: any) => (
                      <MenuCard key={menu.foodId}>
                        <MenuImage src={menu.imageUrl} alt={menu.foodName} />
                        <MenuInfo>
                          <MenuName>{menu.foodName}</MenuName>
                          <MenuPrice>{menu.price.toLocaleString()}원</MenuPrice>
                        </MenuInfo>
                      </MenuCard>
                    ))}
                  </MenuGrid>
                )}
              </StoreInfoSection>
            </StoreCard>
          ))
        ) : (
          <EmptyText>검색 결과가 없습니다</EmptyText>
        )}
      </StoreList>

      <BottomNav activeTab="recommendation" />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #000;
  outline: none;

  &::placeholder {
    color: #999;
  }
`;

const FilterIconButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: #fff;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;

  &:active {
    background-color: #f5f5f5;
  }
`;

const TagBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff;
  overflow-x: auto;
  border-bottom: 1px solid #e0e0e0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TagChip = styled.div`
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
`;

const ResultHeader = styled.div`
  padding: 16px;
  background-color: #fff;
`;

const ResultCount = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ResultKeyword = styled.div`
  font-size: 24px;
  color: #000;
  font-weight: 700;
`;

const StoreList = styled.div`
  padding: 0;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const StoreCard = styled.div`
  background-color: #fff;
  margin-bottom: 12px;
  cursor: pointer;
`;

const StoreImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
`;

const StoreMainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoreNameOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
`;

const StoreName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
`;

const StoreLocation = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);

  &:active {
    transform: scale(0.95);
  }
`;

const StoreInfoSection = styled.div`
  padding: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const InfoItem = styled.span`
  font-size: 13px;
  color: #666;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $isOpen: boolean }>`
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  background-color: ${props => props.$isOpen ? '#ff6b35' : '#999'};
  color: #fff;
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const PriceIcon = styled.span`
  font-size: 14px;
`;

const PopularityBadge = styled.span`
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  background-color: #fff3e0;
  color: #f57c00;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
`;

const MenuCard = styled.div`
  display: flex;
  flex-direction: column;
`;

const MenuImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
`;

const MenuInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MenuName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MenuPrice = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #666;
`;

export default RecommendationPage;
