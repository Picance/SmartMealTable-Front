import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft, FiSearch, FiMenu } from "react-icons/fi";
import { categoryService } from "../../services/category.service";
import type { Category } from "../../types/api";

const FoodPreferencePage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [dislikedIds, setDislikedIds] = useState<number[]>([]);
  // 불러올 때 선호도가 있던 카테고리. 선택을 해제한 항목은 가중치 0으로 보내야 서버에서도 해제된다
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 검색어
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const [categoryResponse, preferenceResponse] = await Promise.all([
          categoryService.getCategories(),
          categoryService.getMyPreferences(),
        ]);
        const preferences = preferenceResponse.data?.categoryPreferences ?? [];

        setCategories(categoryResponse.data?.categories ?? []);
        setLikedIds(
          preferences.filter((p) => p.weight > 0).map((p) => p.categoryId)
        );
        setDislikedIds(
          preferences.filter((p) => p.weight < 0).map((p) => p.categoryId)
        );
        setSavedIds(
          preferences.filter((p) => p.weight !== 0).map((p) => p.categoryId)
        );
      } catch (error) {
        alert("음식 취향을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const getCategoryName = (categoryId: number) =>
    categories.find((c) => c.categoryId === categoryId)?.name ?? "";

  // 필터링된 카테고리
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 선택 해제
  const removeCategory = (categoryId: number) => {
    setLikedIds(likedIds.filter((id) => id !== categoryId));
    setDislikedIds(dislikedIds.filter((id) => id !== categoryId));
  };

  // 누를 때마다 선호 → 불호 → 선택 해제 순으로 바뀐다
  const handleCategoryClick = (categoryId: number) => {
    if (likedIds.includes(categoryId)) {
      setLikedIds(likedIds.filter((id) => id !== categoryId));
      setDislikedIds([...dislikedIds, categoryId]);
    } else if (dislikedIds.includes(categoryId)) {
      setDislikedIds(dislikedIds.filter((id) => id !== categoryId));
    } else {
      setLikedIds([...likedIds, categoryId]);
    }
  };

  // 저장
  const handleSave = async () => {
    const targetIds = Array.from(
      new Set([...savedIds, ...likedIds, ...dislikedIds])
    );
    if (targetIds.length === 0) {
      alert("선호하거나 싫어하는 카테고리를 1개 이상 선택해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      await categoryService.updateCategoryPreferences({
        preferences: targetIds.map((categoryId) => ({
          categoryId,
          weight: likedIds.includes(categoryId)
            ? 100
            : dislikedIds.includes(categoryId)
            ? -100
            : 0,
        })),
      });
      alert("음식 취향이 저장되었습니다.");
      navigate("/profile");
    } catch (error: any) {
      alert(
        error.response?.data?.error?.message ||
          "음식 취향을 저장하지 못했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate("/profile")}>
          <FiChevronLeft />
        </BackButton>
        <Title>음식 취향 설정</Title>
        <Placeholder />
      </Header>

      <Content>
        {/* 설명 */}
        <Description>
          원활한 서비스 제공을 위해 음식 취향을 설정해주세요.
        </Description>

        {isLoading && <Description>음식 취향을 불러오는 중...</Description>}

        {/* 선호하는 음식 카테고리 */}
        <Section>
          <SectionTitle>선호하는 음식 카테고리</SectionTitle>
          <CategoryList>
            {likedIds.map((categoryId) => (
              <CategoryChip
                key={categoryId}
                color="orange"
                onClick={() => removeCategory(categoryId)}
              >
                {getCategoryName(categoryId)}
              </CategoryChip>
            ))}
          </CategoryList>
        </Section>

        {/* 불호하는 음식 카테고리 */}
        <Section>
          <SectionTitle>불호하는 음식 카테고리</SectionTitle>
          <CategoryList>
            {dislikedIds.map((categoryId) => (
              <CategoryChip
                key={categoryId}
                color="yellow"
                onClick={() => removeCategory(categoryId)}
              >
                {getCategoryName(categoryId)}
              </CategoryChip>
            ))}
          </CategoryList>
        </Section>

        {/* 카테고리 선택 */}
        <Section>
          <SectionTitle>카테고리를 눌러 지정해주세요 (선호 → 불호 → 해제)</SectionTitle>

          {/* 검색창 */}
          <SearchBox>
            <SearchIcon>
              <FiSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>

          {/* 카테고리 그리드 */}
          <CategoryGrid>
            {filteredCategories.map((category) => {
              const isLiked = likedIds.includes(category.categoryId);
              const isDisliked = dislikedIds.includes(category.categoryId);

              return (
                <CategoryButton
                  key={category.categoryId}
                  $selected={isLiked || isDisliked}
                  onClick={() => handleCategoryClick(category.categoryId)}
                >
                  <CategoryButtonIcon aria-hidden="true">
                    <FiMenu />
                  </CategoryButtonIcon>
                  {category.name}
                </CategoryButton>
              );
            })}
          </CategoryGrid>
        </Section>

        {/* 저장 버튼 */}
        <SaveButton onClick={handleSave} disabled={isLoading || isSaving}>
          {isSaving ? "저장 중..." : "저장하기"}
        </SaveButton>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
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

const BackButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.accent};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const Placeholder = styled.div`
  width: 32px;
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0 0 ${theme.spacing.xl} 0;
  line-height: 1.5;
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing["2xl"]};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const CategoryChip = styled.button<{ color: "orange" | "yellow" }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${(props) =>
    props.color === "orange" ? theme.colors.accent : theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: ${theme.spacing.lg};
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: #9e9e9e;
  font-size: ${theme.typography.fontSize.lg};
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 40px;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  background-color: #f5f5f5;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    background-color: white;
  }

  &::placeholder {
    color: #9e9e9e;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
`;

const CategoryButton = styled.button<{ $selected?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  background-color: ${(props) => (props.$selected ? "#f5f5f5" : "white")};
  color: #424242;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &:hover {
    background-color: #f5f5f5;
    border-color: ${theme.colors.accent};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const CategoryButtonIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.accent};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${theme.spacing.xl};

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default FoodPreferencePage;
