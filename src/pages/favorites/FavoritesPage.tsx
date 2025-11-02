import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiMoreVertical, FiFilter } from "react-icons/fi";
import BottomNavigation from "../../components/layout/BottomNav";

interface Restaurant {
  id: number;
  name: string;
  image: string;
  rating: number;
  price: string;
  categories: string[];
  address: string;
  isOpen: boolean;
}

const FavoritesPage = () => {
  const navigate = useNavigate();

  // 임시 데이터
  const [restaurants] = useState<Restaurant[]>([
    {
      id: 1,
      name: "비스트로 서울",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      rating: 4.5,
      price: "₩500",
      categories: ["한식", "퓨전"],
      address: "서울시 강남구 테헤란로 123",
      isOpen: true,
    },
    {
      id: 2,
      name: "파스타 피아노",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
      rating: 4.8,
      price: "₩500",
      categories: ["이탈리안"],
      address: "서울시 중구구 상일대로 456",
      isOpen: true,
    },
    {
      id: 3,
      name: "스시 마스터",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
      rating: 4.6,
      price: "₩500",
      categories: ["일식"],
      address: "서울시 중구 명동길 789",
      isOpen: true,
    },
    {
      id: 4,
      name: "차이나 다운",
      image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400",
      rating: 4.7,
      price: "₩500",
      categories: ["중식"],
      address: "서울시 영등포구 국제금융로 10",
      isOpen: true,
    },
    {
      id: 5,
      name: "타이 스페이스",
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400",
      rating: 4.5,
      price: "₩500",
      categories: ["태국 음식"],
      address: "서울시 마포구 독막로 22",
      isOpen: true,
    },
  ]);

  const handleDelete = (id: number) => {
    if (window.confirm("즐겨찾기에서 삭제하시겠습니까?")) {
      // TODO: API 호출
      console.log("Delete restaurant:", id);
    }
  };

  const handleMoreOptions = (id: number) => {
    // TODO: 옵션 모달 표시
    console.log("More options for:", id);
  };

  return (
    <Container>
      <Header>
        <Title>나의 즐겨찾는 레스토랑</Title>
        <FilterButton>
          <FiFilter />
        </FilterButton>
      </Header>

      <Content>
        <RestaurantList>
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id}>
              <CardHeader>
                <MoreButton onClick={() => handleMoreOptions(restaurant.id)}>
                  <FiMoreVertical />
                </MoreButton>
                <DeleteButton onClick={() => handleDelete(restaurant.id)}>
                  🗑️
                </DeleteButton>
              </CardHeader>

              <RestaurantImage
                src={restaurant.image}
                alt={restaurant.name}
                onClick={() => navigate(`/store/${restaurant.id}`)}
              />

              <RestaurantInfo>
                <RestaurantName>{restaurant.name}</RestaurantName>
                
                <MetaRow>
                  <Rating>⭐ 리뷰 {restaurant.rating.toFixed(1)}</Rating>
                  <Price>{restaurant.price}</Price>
                </MetaRow>

                <Categories>
                  {restaurant.categories.join(", ")}
                </Categories>

                <Address>{restaurant.address}</Address>

                {restaurant.isOpen && (
                  <OpenBadge>지금 영업 중</OpenBadge>
                )}
              </RestaurantInfo>
            </RestaurantCard>
          ))}
        </RestaurantList>
      </Content>

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

const FilterButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  color: #424242;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
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

export default FavoritesPage;
