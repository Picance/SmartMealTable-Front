import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiCheck } from "react-icons/fi";
import { theme } from "../../styles/theme";
import { onboardingService } from "../../services/onboarding.service";
import type { Food } from "../../types/api";

const OnboardingFoodPreferencePage = () => {
  const navigate = useNavigate();

  // 음식 관련 상태
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 무한 스크롤을 위한 ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // 음식 목록 조회
  const fetchFoods = useCallback(
    async (pageNumber: number) => {
      if (loading || !hasMore) return;

      try {
        setLoading(true);
        const response = await onboardingService.getFoods(
          undefined,
          pageNumber,
          20
        );

        if (response.result === "SUCCESS" && response.data) {
          const newFoods = response.data.content;

          setFoods((prev) =>
            pageNumber === 0 ? newFoods : [...prev, ...newFoods]
          );

          setHasMore(!response.data.last);
        }
      } catch (error) {
        console.error("음식 목록 조회 실패:", error);
        alert("음식 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore]
  );

  // 초기 로드
  useEffect(() => {
    fetchFoods(0);
  }, []);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (page > 0) {
      fetchFoods(page);
    }
  }, [page]);

  // 음식 선택 토글
  const toggleFoodSelection = (foodId: number) => {
    if (selectedFoods.includes(foodId)) {
      setSelectedFoods(selectedFoods.filter((id) => id !== foodId));
    } else {
      setSelectedFoods([...selectedFoods, foodId]);
    }
  };

  // 저장하기
  const handleSubmit = async () => {
    // 선택 없이도 저장 가능 (최소 0개)
    try {
      setLoading(true);
      const response = await onboardingService.saveFoodPreferences({
        preferredFoodIds: selectedFoods,
      });

      if (response.result === "SUCCESS" && response.data) {
        console.log(
          `${response.data.savedCount}개의 음식 선호도가 저장되었습니다.`
        );
        navigate("/onboarding/policy");
      } else {
        throw new Error(response.error?.message || "음식 선호도 저장 실패");
      }
    } catch (error) {
      console.error("음식 선호도 저장 실패:", error);
      alert("음식 선호도를 저장하는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>음식 취향 선택</Title>
        </Header>

        <Section>
          <SectionTitle>선호하는 음식을 선택해주세요</SectionTitle>
          <SectionDescription>
            취향에 맞는 음식 추천을 위해 선택해주세요.
          </SectionDescription>
          {selectedFoods.length > 0 && (
            <SelectedCount>{selectedFoods.length}개 선택됨</SelectedCount>
          )}
        </Section>

        <FoodGrid>
          {foods.map((food) => (
            <FoodCard
              key={food.foodId}
              $selected={selectedFoods.includes(food.foodId)}
              onClick={() => toggleFoodSelection(food.foodId)}
            >
              <FoodImage
                src={food.imageUrl}
                alt={food.foodName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-size='32' text-anchor='middle' fill='%239e9e9e' dy='.3em'%3EFOOD%3C/text%3E%3C/svg%3E";
                }}
              />
              <FoodInfo>
                <FoodName>{food.foodName}</FoodName>
                <FoodCategory>{food.categoryName}</FoodCategory>
                <FoodPrice>{food.averagePrice.toLocaleString()}원</FoodPrice>
              </FoodInfo>
              <Checkbox $checked={selectedFoods.includes(food.foodId)}>
                {selectedFoods.includes(food.foodId) && <FiCheck />}
              </Checkbox>
            </FoodCard>
          ))}
        </FoodGrid>

        {/* 무한 스크롤 관찰 대상 */}
        <ObserverTarget ref={observerTarget} />

        {loading && (
          <LoadingContainer>
            <LoadingMessage>음식 목록을 불러오는 중...</LoadingMessage>
          </LoadingContainer>
        )}

        {!loading && !hasMore && foods.length > 0 && (
          <EndMessage>모든 음식을 불러왔습니다.</EndMessage>
        )}

        {foods.length === 0 && !loading && (
          <EmptyContainer>
            <EmptyMessage>음식 목록이 없습니다.</EmptyMessage>
          </EmptyContainer>
        )}
      </Container>

      <ButtonGroup>
        <SubmitButton onClick={handleSubmit} disabled={loading}>
          {loading ? "저장 중..." : "저장하기"}
        </SubmitButton>
      </ButtonGroup>
    </Wrapper>
  );
};

// Styled Components
const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fafafa;
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: 130px;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  text-align: center;
`;

const Section = styled.section`
  padding: ${theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const SectionDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0;
  line-height: 1.5;
`;

const SelectedCount = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.accent};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: ${theme.spacing.sm} 0 0 0;
`;

const FoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.lg} ${theme.spacing.lg};
`;

const FoodCard = styled.div<{ $selected?: boolean }>`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border: 2px solid
    ${(props) => (props.$selected ? theme.colors.accent : "transparent")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FoodImage = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  background-color: #f5f5f5;
`;

const FoodInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  flex: 1;
`;

const FoodName = styled.p`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const FoodCategory = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0;
`;

const FoodPrice = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.accent};
  margin: 0;
`;

const Checkbox = styled.div<{ $checked?: boolean }>`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  width: 24px;
  height: 24px;
  border: 2px solid
    ${(props) => (props.$checked ? theme.colors.accent : "#e0e0e0")};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${(props) =>
    props.$checked ? theme.colors.accent : "white"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ObserverTarget = styled.div`
  height: 20px;
  margin: ${theme.spacing.md} 0;
`;

const LoadingContainer = styled.div`
  padding: ${theme.spacing.lg};
  text-align: center;
`;

const LoadingMessage = styled.p`
  color: #757575;
  font-size: ${theme.typography.fontSize.sm};
  margin: 0;
`;

const EndMessage = styled.p`
  color: #9e9e9e;
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.lg};
  margin: 0;
`;

const EmptyContainer = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const EmptyMessage = styled.p`
  color: #9e9e9e;
  font-size: ${theme.typography.fontSize.base};
  margin: 0;
`;

const ButtonGroup = styled.div`
  position: fixed;
  bottom: 0;
  max-width: 480px;
  width: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 ${theme.spacing.lg};
  padding-top: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.lg};
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  box-sizing: border-box;
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${(props) =>
    props.disabled ? "#e0e0e0" : theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#e0e0e0" : "#e55a2b")};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "scale(0.98)")};
  }
`;

export default OnboardingFoodPreferencePage;
