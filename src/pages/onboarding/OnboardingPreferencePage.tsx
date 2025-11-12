import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { categoryService } from "../../services/category.service";
import type { Category } from "../../types/api";

// 임시 음식 이미지 데이터
const FOOD_IMAGES = [
  { id: 1, name: "후라이드 치킨", image: "🍗", category: "치킨" },
  { id: 2, name: "양념 치킨", image: "🍖", category: "치킨" },
  { id: 3, name: "마라 간장 치킨", image: "🍗", category: "치킨" },
  { id: 4, name: "피자", image: "🍕", category: "피자" },
  { id: 5, name: "햄버거", image: "🍔", category: "버거" },
  { id: 6, name: "파스타", image: "🍝", category: "파스타" },
];

type DragZone = "liked" | "disliked" | "available";

const OnboardingPreferencePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 카테고리 선택, 2: 음식 선택

  // 카테고리 관련 상태
  const [likedCategories, setLikedCategories] = useState<Category[]>([]);
  const [dislikedCategories, setDislikedCategories] = useState<Category[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 드래그 앤 드롭 관련 상태
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dragSourceZone, setDragSourceZone] = useState<DragZone | null>(null);
  const [dragOverZone, setDragOverZone] = useState<DragZone | null>(null);

  // Step 2: 음식 선택
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);

  // 카테고리 목록 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        if (response.result === "SUCCESS" && response.data) {
          const categories = response.data.categories;
          setAvailableCategories(categories);
        }
      } catch (error) {
        console.error("카테고리 조회 실패:", error);
        alert("카테고리를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 검색 필터링된 카테고리
  const filteredAvailableCategories = availableCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 드래그 시작
  const handleDragStart = (category: Category, zone: DragZone) => {
    setDraggedCategory(category);
    setDragSourceZone(zone);
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, zone: DragZone) => {
    e.preventDefault();
    setDragOverZone(zone);
  };

  // 드래그 떠남
  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  // 드롭
  const handleDrop = (e: React.DragEvent, targetZone: DragZone) => {
    e.preventDefault();
    if (!draggedCategory || !dragSourceZone) return;
    if (dragSourceZone === targetZone) {
      setDragOverZone(null);
      setDraggedCategory(null);
      setDragSourceZone(null);
      return;
    }

    // 원래 영역에서 제거
    if (dragSourceZone === "liked") {
      setLikedCategories(
        likedCategories.filter(
          (c) => c.categoryId !== draggedCategory.categoryId
        )
      );
    } else if (dragSourceZone === "disliked") {
      setDislikedCategories(
        dislikedCategories.filter(
          (c) => c.categoryId !== draggedCategory.categoryId
        )
      );
    } else if (dragSourceZone === "available") {
      setAvailableCategories(
        availableCategories.filter(
          (c) => c.categoryId !== draggedCategory.categoryId
        )
      );
    }

    // 새 영역에 추가
    if (targetZone === "liked") {
      setLikedCategories([...likedCategories, draggedCategory]);
    } else if (targetZone === "disliked") {
      setDislikedCategories([...dislikedCategories, draggedCategory]);
    } else if (targetZone === "available") {
      setAvailableCategories([...availableCategories, draggedCategory]);
    }

    setDragOverZone(null);
    setDraggedCategory(null);
    setDragSourceZone(null);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDragOverZone(null);
    setDraggedCategory(null);
    setDragSourceZone(null);
  };

  // 카테고리 제거 (X 버튼)
  const removeFromLiked = (categoryId: number) => {
    const category = likedCategories.find((c) => c.categoryId === categoryId);
    if (category) {
      setLikedCategories(
        likedCategories.filter((c) => c.categoryId !== categoryId)
      );
      setAvailableCategories([...availableCategories, category]);
    }
  };

  const removeFromDisliked = (categoryId: number) => {
    const category = dislikedCategories.find(
      (c) => c.categoryId === categoryId
    );
    if (category) {
      setDislikedCategories(
        dislikedCategories.filter((c) => c.categoryId !== categoryId)
      );
      setAvailableCategories([...availableCategories, category]);
    }
  };

  // 음식 선택 토글
  const toggleFoodSelection = (foodId: number) => {
    if (selectedFoods.includes(foodId)) {
      setSelectedFoods(selectedFoods.filter((id) => id !== foodId));
    } else {
      setSelectedFoods([...selectedFoods, foodId]);
    }
  };

  // Step 1 -> Step 2
  const handleStep1Next = async () => {
    if (likedCategories.length === 0 && dislikedCategories.length === 0) {
      alert(
        "선호하는 카테고리 또는 불호하는 카테고리를 최소 1개 이상 선택해주세요."
      );
      return;
    }

    try {
      setLoading(true);
      const preferences = [
        ...likedCategories.map((category) => ({
          categoryId: category.categoryId,
          weight: 100 as const,
        })),
        ...dislikedCategories.map((category) => ({
          categoryId: category.categoryId,
          weight: -100 as const,
        })),
      ];

      const response = await categoryService.updateCategoryPreferences({
        preferences,
      });

      if (response.result === "SUCCESS") {
        setStep(2);
      } else {
        throw new Error(response.error?.message || "카테고리 선호도 저장 실패");
      }
    } catch (error) {
      console.error("카테고리 선호도 저장 실패:", error);
      alert("카테고리 선호도를 저장하는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> 완료
  const handleStep2Next = () => {
    // TODO: API 호출
    navigate("/onboarding/policy");
  };

  return (
    <Container>
      <Header>
        <Title>음식 취향 {step === 1 ? "설정" : "선택"}</Title>
      </Header>

      {step === 1 && (
        <>
          <Section>
            <SectionTitle>신규 회원 가입 (음식 선호/불호)</SectionTitle>
            <SectionDescription>
              완벽한 서비스 제공을 위해 음식 취향을 설정해주세요.
            </SectionDescription>
          </Section>

          {/* 선호하는 카테고리 드롭 영역 */}
          <Section>
            <SubTitle>선호하는 음식 카테고리 (우선순위 순서)</SubTitle>
            <DropZone
              onDragOver={(e) => handleDragOver(e, "liked")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "liked")}
              $isOver={dragOverZone === "liked"}
              $isEmpty={likedCategories.length === 0}
            >
              {likedCategories.length === 0 ? (
                <EmptyMessage>아래에서 드래그하여 추가하세요</EmptyMessage>
              ) : (
                <CategoryChipGroup>
                  {likedCategories.map((category) => (
                    <CategoryChip
                      key={category.categoryId}
                      draggable
                      onDragStart={() => handleDragStart(category, "liked")}
                      onDragEnd={handleDragEnd}
                      $color="orange"
                      $isDragging={
                        draggedCategory?.categoryId === category.categoryId
                      }
                    >
                      {category.name}
                      <RemoveButton
                        onClick={() => removeFromLiked(category.categoryId)}
                      >
                        ×
                      </RemoveButton>
                    </CategoryChip>
                  ))}
                </CategoryChipGroup>
              )}
            </DropZone>
          </Section>

          {/* 불호하는 카테고리 드롭 영역 */}
          <Section>
            <SubTitle>불호하는 음식 카테고리 (우선순위 순서)</SubTitle>
            <DropZone
              onDragOver={(e) => handleDragOver(e, "disliked")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "disliked")}
              $isOver={dragOverZone === "disliked"}
              $isEmpty={dislikedCategories.length === 0}
            >
              {dislikedCategories.length === 0 ? (
                <EmptyMessage>아래에서 드래그하여 추가하세요</EmptyMessage>
              ) : (
                <CategoryChipGroup>
                  {dislikedCategories.map((category) => (
                    <CategoryChip
                      key={category.categoryId}
                      draggable
                      onDragStart={() => handleDragStart(category, "disliked")}
                      onDragEnd={handleDragEnd}
                      $color="yellow"
                      $isDragging={
                        draggedCategory?.categoryId === category.categoryId
                      }
                    >
                      {category.name}
                      <RemoveButton
                        onClick={() => removeFromDisliked(category.categoryId)}
                      >
                        ×
                      </RemoveButton>
                    </CategoryChip>
                  ))}
                </CategoryChipGroup>
              )}
            </DropZone>
          </Section>

          {/* 전체 카테고리 목록 */}
          <Section>
            <SubTitle>드래그 앤 드롭으로 지정해주세요</SubTitle>
            <SearchInput
              type="text"
              placeholder="🔍  카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CategoryGrid
              onDragOver={(e) => handleDragOver(e, "available")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "available")}
            >
              {loading ? (
                <LoadingMessage>카테고리를 불러오는 중...</LoadingMessage>
              ) : filteredAvailableCategories.length === 0 ? (
                <EmptyMessage>
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : "모든 카테고리를 선택했습니다"}
                </EmptyMessage>
              ) : (
                filteredAvailableCategories.map((category) => (
                  <DraggableCategory
                    key={category.categoryId}
                    draggable
                    onDragStart={() => handleDragStart(category, "available")}
                    onDragEnd={handleDragEnd}
                    $isDragging={
                      draggedCategory?.categoryId === category.categoryId
                    }
                  >
                    ≡ {category.name}
                  </DraggableCategory>
                ))
              )}
            </CategoryGrid>
          </Section>

          <ButtonGroup>
            <SubmitButton
              onClick={handleStep1Next}
              disabled={
                loading ||
                (likedCategories.length === 0 &&
                  dislikedCategories.length === 0)
              }
            >
              {loading ? "저장 중..." : "저장하기"}
            </SubmitButton>
            <SkipButton onClick={() => navigate("/onboarding/policy")}>
              건너뛰기
            </SkipButton>
          </ButtonGroup>
        </>
      )}

      {step === 2 && (
        <>
          <Section>
            <SectionTitle>선호하는 음식을 선택해주세요</SectionTitle>
            <SectionDescription>
              취향에 맞는 음식 추천을 위해 선택해주세요.
            </SectionDescription>
          </Section>

          <FoodGrid>
            {FOOD_IMAGES.map((food) => (
              <FoodCard
                key={food.id}
                $selected={selectedFoods.includes(food.id)}
                onClick={() => toggleFoodSelection(food.id)}
              >
                <FoodImage>{food.image}</FoodImage>
                <FoodName>{food.name}</FoodName>
                <Checkbox $checked={selectedFoods.includes(food.id)}>
                  {selectedFoods.includes(food.id) && "✓"}
                </Checkbox>
              </FoodCard>
            ))}
          </FoodGrid>

          <NextButton onClick={handleStep2Next}>다음</NextButton>
        </>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: ${theme.spacing.xl};
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
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

const SubTitle = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

// 드롭 영역
const DropZone = styled.div<{ $isOver?: boolean; $isEmpty?: boolean }>`
  min-height: 100px;
  padding: ${theme.spacing.lg};
  border: 2px dashed
    ${(props) =>
      props.$isOver
        ? theme.colors.primary
        : props.$isEmpty
        ? "#e0e0e0"
        : "#bdbdbd"};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${(props) =>
    props.$isOver ? "#f0f7ff" : props.$isEmpty ? "#fafafa" : "white"};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyMessage = styled.p`
  color: #9e9e9e;
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  margin: 0;
`;

const LoadingMessage = styled.p`
  color: #757575;
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  margin: 0;
  grid-column: 1 / -1;
`;

const CategoryChipGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  width: 100%;
`;

const CategoryChip = styled.div<{
  $color?: "orange" | "yellow";
  $isDragging?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  background-color: ${(props) =>
    props.$color === "orange" ? theme.colors.accent : theme.colors.secondary};
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: move;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &:active {
    cursor: grabbing;
  }
`;

const RemoveButton = styled.button`
  width: 20px;
  height: 20px;
  border: none;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  background-color: white;
  margin-top: ${theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: #9e9e9e;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  min-height: 200px;
`;

const DraggableCategory = styled.button<{ $isDragging?: boolean }>`
  padding: ${theme.spacing.md};
  background-color: ${(props) => (props.$isDragging ? "#f0f0f0" : "white")};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  color: #424242;
  cursor: move;
  transition: all 0.2s;
  text-align: left;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};

  &:hover {
    background-color: #f5f5f5;
    border-color: #bdbdbd;
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
  }
`;

const ButtonGroup = styled.div`
  padding: 0 ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
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

const SkipButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: transparent;
  color: #757575;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Step 2 Styles
const FoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
`;

const FoodCard = styled.div<{ $selected?: boolean }>`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  border: 2px solid
    ${(props) => (props.$selected ? theme.colors.accent : "transparent")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FoodImage = styled.div`
  font-size: 80px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: ${theme.borderRadius.md};
`;

const FoodName = styled.p`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: #212121;
  margin: 0;
  text-align: center;
`;

const Checkbox = styled.div<{ $checked?: boolean }>`
  position: absolute;
  bottom: ${theme.spacing.md};
  right: ${theme.spacing.md};
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
`;

const NextButton = styled.button`
  width: calc(100% - ${theme.spacing.lg} * 2);
  margin: ${theme.spacing.xl} ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ff9f3a;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default OnboardingPreferencePage;
