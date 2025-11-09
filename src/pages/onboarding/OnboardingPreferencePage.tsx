import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";

// 임시 음식 이미지 데이터
const FOOD_IMAGES = [
  { id: 1, name: "후라이드 치킨", image: "🍗", category: "치킨" },
  { id: 2, name: "양념 치킨", image: "🍖", category: "치킨" },
  { id: 3, name: "마라 간장 치킨", image: "🍗", category: "치킨" },
  { id: 4, name: "피자", image: "🍕", category: "피자" },
  { id: 5, name: "햄버거", image: "🍔", category: "버거" },
  { id: 6, name: "파스타", image: "🍝", category: "파스타" },
];

const OnboardingPreferencePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 카테고리 선택, 2: 음식 선택

  // Step 1: 카테고리 선호도
  const [likedCategories, setLikedCategories] = useState<string[]>([]);
  const [dislikedCategories, setDislikedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2: 음식 선택
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);

  // 선호 카테고리 토글
  const toggleLikeCategory = (category: string) => {
    if (likedCategories.includes(category)) {
      setLikedCategories(likedCategories.filter((c) => c !== category));
    } else {
      setLikedCategories([...likedCategories, category]);
      // 불호에서 제거
      setDislikedCategories(dislikedCategories.filter((c) => c !== category));
    }
  };

  // 불호 카테고리 토글
  const toggleDislikeCategory = (category: string) => {
    if (dislikedCategories.includes(category)) {
      setDislikedCategories(dislikedCategories.filter((c) => c !== category));
    } else {
      setDislikedCategories([...dislikedCategories, category]);
      // 선호에서 제거
      setLikedCategories(likedCategories.filter((c) => c !== category));
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
  const handleStep1Next = () => {
    if (likedCategories.length > 0 || dislikedCategories.length > 0) {
      setStep(2);
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

          <Section>
            <SubTitle>선호하는 음식 카테고리 (우선순위 순서)</SubTitle>
            <CategoryButtonGroup>
              <CategoryButton
                $active={likedCategories.includes("한식")}
                $color="orange"
                onClick={() => toggleLikeCategory("한식")}
              >
                한식
              </CategoryButton>
              <CategoryButton
                $active={likedCategories.includes("중식")}
                $color="orange"
                onClick={() => toggleLikeCategory("중식")}
              >
                중식
              </CategoryButton>
              <CategoryButton
                $active={likedCategories.includes("양식")}
                $color="orange"
                onClick={() => toggleLikeCategory("양식")}
              >
                양식
              </CategoryButton>
            </CategoryButtonGroup>
          </Section>

          <Section>
            <SubTitle>불호하는 음식 카테고리 (우선순위 순서)</SubTitle>
            <CategoryButtonGroup>
              <CategoryButton
                $active={dislikedCategories.includes("해산물")}
                $color="yellow"
                onClick={() => toggleDislikeCategory("해산물")}
              >
                해산물
              </CategoryButton>
              <CategoryButton
                $active={dislikedCategories.includes("매운 음식")}
                $color="yellow"
                onClick={() => toggleDislikeCategory("매운 음식")}
              >
                매운 음식
              </CategoryButton>
              <CategoryButton
                $active={dislikedCategories.includes("달콤한 음식")}
                $color="yellow"
                onClick={() => toggleDislikeCategory("달콤한 음식")}
              >
                달콤한 음식
              </CategoryButton>
            </CategoryButtonGroup>
          </Section>

          <Section>
            <SubTitle>드래그 앤 드롭으로 지정해주세요</SubTitle>
            <SearchInput
              type="text"
              placeholder="🔍  카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <DragDropGrid>
              <DragDropButton>≡ 일식</DragDropButton>
              <DragDropButton>≡ 이탈리안</DragDropButton>
              <DragDropButton>≡ 베트남</DragDropButton>
              <DragDropButton>≡ 인도</DragDropButton>
              <DragDropButton>≡ 멕시칸</DragDropButton>
              <DragDropButton>≡ 태국</DragDropButton>
              <DragDropButton>≡ 퓨전</DragDropButton>
              <DragDropButton>≡ 지중해</DragDropButton>
              <DragDropButton>≡ 아랍</DragDropButton>
              <DragDropButton>≡ 프랑스</DragDropButton>
              <DragDropButton>≡ 지중해</DragDropButton>
              <DragDropButton>≡ 디저트</DragDropButton>
              <DragDropButton>≡ 패스트푸드</DragDropButton>
              <DragDropButton>≡ 건강식</DragDropButton>
              <DragDropButton>≡ 스낵</DragDropButton>
            </DragDropGrid>
          </Section>

          <ButtonGroup>
            <SubmitButton
              onClick={handleStep1Next}
              disabled={
                likedCategories.length === 0 && dislikedCategories.length === 0
              }
            >
              저장하기
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

const CategoryButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const CategoryButton = styled.button<{
  $active?: boolean;
  $color?: "orange" | "yellow";
}>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.full};
  border: none;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  background-color: ${(props) =>
    props.$active
      ? props.$color === "orange"
        ? theme.colors.accent
        : theme.colors.secondary
      : "white"};
  color: ${(props) => (props.$active ? "white" : "#424242")};
  box-shadow: ${(props) =>
    props.$active ? "none" : "0 1px 3px rgba(0, 0, 0, 0.1)"};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
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

const DragDropGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const DragDropButton = styled.button`
  padding: ${theme.spacing.md};
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  color: #424242;
  cursor: move;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background-color: #f5f5f5;
    border-color: #bdbdbd;
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
