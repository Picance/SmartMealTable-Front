import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiMoreVertical, FiFilter } from "react-icons/fi";
import BottomNavigation from "../../components/layout/BottomNav";
import {
  favoriteService,
  type Favorite,
  type SortBy,
} from "../../services/favorite.service";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("priority");
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    loadFavorites();
  }, [sortBy, isOpenOnly]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteService.getFavorites({
        sortBy,
        isOpenOnly,
        size: 50,
      });

      if (response.result === "SUCCESS" && response.data) {
        setFavorites(response.data.favorites);
        setTotalCount(response.data.totalCount);
        setOpenCount(response.data.openCount);
      }
    } catch (error) {
      console.error("즐겨찾기 목록 조회 실패:", error);
      alert("즐겨찾기 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (favoriteId: number) => {
    if (window.confirm("즐겨찾기에서 삭제하시겠습니까?")) {
      try {
        await favoriteService.deleteFavorite(favoriteId);
        // 목록 새로고침
        await loadFavorites();
      } catch (error) {
        console.error("즐겨찾기 삭제 실패:", error);
        alert("즐겨찾기 삭제에 실패했습니다.");
      }
    }
  };

  const handleMoreOptions = (favoriteId: number) => {
    // TODO: 옵션 모달 표시
    console.log("More options for:", favoriteId);
  };

  const toggleFilter = () => {
    setIsOpenOnly(!isOpenOnly);
  };

  return (
    <Container>
      <Header>
        <Title>나의 즐겨찾는 레스토랑</Title>
        <FilterButton onClick={toggleFilter} $active={isOpenOnly}>
          <FiFilter />
        </FilterButton>
      </Header>

      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>로딩 중...</LoadingText>
        </LoadingContainer>
      ) : favorites.length === 0 ? (
        <EmptyContainer>
          <EmptyIcon>⭐</EmptyIcon>
          <EmptyTitle>즐겨찾기가 비어있습니다</EmptyTitle>
          <EmptyDescription>
            마음에 드는 가게를 즐겨찾기에 추가해보세요!
            {isOpenOnly && "\n\n현재 영업 중인 가게만 표시하고 있습니다."}
          </EmptyDescription>
          {isOpenOnly && (
            <EmptyButton onClick={() => setIsOpenOnly(false)}>
              모든 즐겨찾기 보기
            </EmptyButton>
          )}
        </EmptyContainer>
      ) : (
        <Content>
          <StatusBar>
            <StatusText>
              전체 {totalCount}개 · 영업 중 {openCount}개
            </StatusText>
          </StatusBar>

          <RestaurantList>
            {favorites.map((favorite) => (
              <RestaurantCard key={favorite.favoriteId}>
                <CardHeader>
                  <MoreButton
                    onClick={() => handleMoreOptions(favorite.favoriteId)}
                  >
                    <FiMoreVertical />
                  </MoreButton>
                  <DeleteButton
                    onClick={() => handleDelete(favorite.favoriteId)}
                  >
                    🗑️
                  </DeleteButton>
                </CardHeader>

                <RestaurantImage
                  src={favorite.imageUrl || "/placeholder-store.jpg"}
                  alt={favorite.storeName}
                  onClick={() => navigate(`/store/${favorite.storeId}`)}
                />

                <RestaurantInfo>
                  <RestaurantName>{favorite.storeName}</RestaurantName>

                  <MetaRow>
                    <Rating>
                      ⭐ {favorite.reviewCount.toLocaleString()} 리뷰
                    </Rating>
                    <Price>
                      평균 ₩{favorite.averagePrice.toLocaleString()}
                    </Price>
                  </MetaRow>

                  <Categories>{favorite.categoryName}</Categories>

                  <Address>
                    {favorite.address} · {favorite.distance.toFixed(1)}km
                  </Address>

                  {favorite.isOpenNow ? (
                    <OpenBadge>지금 영업 중</OpenBadge>
                  ) : (
                    <ClosedBadge>영업 종료</ClosedBadge>
                  )}
                </RestaurantInfo>
              </RestaurantCard>
            ))}
          </RestaurantList>
        </Content>
      )}

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="favorites" />
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
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  flex: 1;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  background: ${(props) =>
    props.$active ? theme.colors.primary : "transparent"};
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  color: ${(props) => (props.$active ? "white" : "#424242")};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: ${theme.spacing.md};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid ${theme.colors.primary};
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
  font-size: ${theme.typography.fontSize.md};
  color: #666;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing.lg};
  opacity: 0.5;
`;

const EmptyTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const EmptyDescription = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: #757575;
  line-height: 1.6;
  margin: 0 0 ${theme.spacing.xl} 0;
  white-space: pre-line;
`;

const EmptyButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatusBar = styled.div`
  padding: ${theme.spacing.sm} 0;
  margin-bottom: ${theme.spacing.md};
`;

const StatusText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const RestaurantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const RestaurantCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
`;

const CardHeader = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  right: ${theme.spacing.md};
  display: flex;
  justify-content: space-between;
  z-index: 10;
`;

const MoreButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.sm};
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${theme.colors.accent};
  font-size: ${theme.typography.fontSize.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: white;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DeleteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.sm};
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${theme.typography.fontSize.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #ffebee;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const RestaurantImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const RestaurantInfo = styled.div`
  padding: ${theme.spacing.md};
`;

const RestaurantName = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xs};
`;

const Rating = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: #424242;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const Price = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: #424242;
`;

const Categories = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.xs};
`;

const Address = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.sm};
`;

const OpenBadge = styled.div`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.secondary};
  color: white;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ClosedBadge = styled.div`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: #9e9e9e;
  color: white;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export default FavoritesPage;
