import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { categoryService } from "../../services/category.service";
import type { Category } from "../../types/api";

const OnboardingPreferencePage = () => {
  const navigate = useNavigate();

  const [likedCategories, setLikedCategories] = useState<Category[]>([]);
  const [dislikedCategories, setDislikedCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [likedSearchQuery, setLikedSearchQuery] = useState("");
  const [dislikedSearchQuery, setDislikedSearchQuery] = useState("");
  const [showLikedDropdown, setShowLikedDropdown] = useState(false);
  const [showDislikedDropdown, setShowDislikedDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const likedSearchRef = useRef<HTMLDivElement>(null);
  const dislikedSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        if (response.result === "SUCCESS" && response.data) {
          setAllCategories(response.data.categories);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        likedSearchRef.current &&
        !likedSearchRef.current.contains(event.target as Node)
      ) {
        setShowLikedDropdown(false);
      }
      if (
        dislikedSearchRef.current &&
        !dislikedSearchRef.current.contains(event.target as Node)
      ) {
        setShowDislikedDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilteredLikedCategories = () => {
    const selectedIds = [
      ...likedCategories.map((c) => c.categoryId),
      ...dislikedCategories.map((c) => c.categoryId),
    ];

    return allCategories
      .filter((cat) => !selectedIds.includes(cat.categoryId))
      .filter((cat) =>
        cat.name.toLowerCase().includes(likedSearchQuery.toLowerCase())
      );
  };

  const getFilteredDislikedCategories = () => {
    const selectedIds = [
      ...likedCategories.map((c) => c.categoryId),
      ...dislikedCategories.map((c) => c.categoryId),
    ];

    return allCategories
      .filter((cat) => !selectedIds.includes(cat.categoryId))
      .filter((cat) =>
        cat.name.toLowerCase().includes(dislikedSearchQuery.toLowerCase())
      );
  };

  const addLikedCategory = (category: Category) => {
    setLikedCategories([...likedCategories, category]);
    setLikedSearchQuery("");
    setShowLikedDropdown(false);
  };

  const addDislikedCategory = (category: Category) => {
    setDislikedCategories([...dislikedCategories, category]);
    setDislikedSearchQuery("");
    setShowDislikedDropdown(false);
  };

  const removeLikedCategory = (categoryId: number) => {
    setLikedCategories(
      likedCategories.filter((c) => c.categoryId !== categoryId)
    );
  };

  const removeDislikedCategory = (categoryId: number) => {
    setDislikedCategories(
      dislikedCategories.filter((c) => c.categoryId !== categoryId)
    );
  };

  const moveLikedUp = (index: number) => {
    if (index === 0) return;
    const newList = [...likedCategories];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setLikedCategories(newList);
  };

  const moveDislikedUp = (index: number) => {
    if (index === 0) return;
    const newList = [...dislikedCategories];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setDislikedCategories(newList);
  };

  const moveLikedDown = (index: number) => {
    if (index === likedCategories.length - 1) return;
    const newList = [...likedCategories];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    setLikedCategories(newList);
  };

  const moveDislikedDown = (index: number) => {
    if (index === dislikedCategories.length - 1) return;
    const newList = [...dislikedCategories];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    setDislikedCategories(newList);
  };

  const handleSubmit = async () => {
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
        navigate("/onboarding/food-preference");
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

  return (
    <Container>
      <Header>
        <Title>음식 카테고리 설정</Title>
      </Header>

      <Section>
        <SectionTitle>신규 회원 가입 (음식 선호/불호)</SectionTitle>
        <SectionDescription>
          완벽한 서비스 제공을 위해 음식 취향을 설정해주세요.
        </SectionDescription>
      </Section>

      <Section>
        <SubTitle>선호하는 음식 카테고리 (우선순위 순서)</SubTitle>
        <SearchContainer ref={likedSearchRef}>
          <SearchInput
            type="text"
            placeholder="카테고리 검색..."
            value={likedSearchQuery}
            onChange={(e) => {
              setLikedSearchQuery(e.target.value);
              setShowLikedDropdown(true);
            }}
            onFocus={() => setShowLikedDropdown(true)}
          />
          {showLikedDropdown && likedSearchQuery && (
            <SearchDropdown>
              {getFilteredLikedCategories().length > 0 ? (
                getFilteredLikedCategories().map((category) => (
                  <DropdownItem
                    key={category.categoryId}
                    onClick={() => addLikedCategory(category)}
                  >
                    {category.name}
                  </DropdownItem>
                ))
              ) : (
                <EmptyDropdown>검색 결과가 없습니다</EmptyDropdown>
              )}
            </SearchDropdown>
          )}
        </SearchContainer>

        <CategoryList>
          {likedCategories.length === 0 ? (
            <EmptyMessage>검색하여 카테고리를 추가해주세요</EmptyMessage>
          ) : (
            likedCategories.map((category, index) => (
              <CategoryItem key={category.categoryId} $type="liked">
                <CategoryInfo>
                  <PriorityBadge>{index + 1}</PriorityBadge>
                  <CategoryName>{category.name}</CategoryName>
                </CategoryInfo>
                <ActionButtons>
                  <PriorityButton
                    onClick={() => moveLikedUp(index)}
                    disabled={index === 0}
                  >
                    ▲
                  </PriorityButton>
                  <PriorityButton
                    onClick={() => moveLikedDown(index)}
                    disabled={index === likedCategories.length - 1}
                  >
                    ▼
                  </PriorityButton>
                  <RemoveButton
                    onClick={() => removeLikedCategory(category.categoryId)}
                  >
                    ✕
                  </RemoveButton>
                </ActionButtons>
              </CategoryItem>
            ))
          )}
        </CategoryList>
      </Section>

      <Section>
        <SubTitle>불호하는 음식 카테고리 (우선순위 순서)</SubTitle>
        <SearchContainer ref={dislikedSearchRef}>
          <SearchInput
            type="text"
            placeholder="카테고리 검색..."
            value={dislikedSearchQuery}
            onChange={(e) => {
              setDislikedSearchQuery(e.target.value);
              setShowDislikedDropdown(true);
            }}
            onFocus={() => setShowDislikedDropdown(true)}
          />
          {showDislikedDropdown && dislikedSearchQuery && (
            <SearchDropdown>
              {getFilteredDislikedCategories().length > 0 ? (
                getFilteredDislikedCategories().map((category) => (
                  <DropdownItem
                    key={category.categoryId}
                    onClick={() => addDislikedCategory(category)}
                  >
                    {category.name}
                  </DropdownItem>
                ))
              ) : (
                <EmptyDropdown>검색 결과가 없습니다</EmptyDropdown>
              )}
            </SearchDropdown>
          )}
        </SearchContainer>

        <CategoryList>
          {dislikedCategories.length === 0 ? (
            <EmptyMessage>검색하여 카테고리를 추가해주세요</EmptyMessage>
          ) : (
            dislikedCategories.map((category, index) => (
              <CategoryItem key={category.categoryId} $type="disliked">
                <CategoryInfo>
                  <PriorityBadge>{index + 1}</PriorityBadge>
                  <CategoryName>{category.name}</CategoryName>
                </CategoryInfo>
                <ActionButtons>
                  <PriorityButton
                    onClick={() => moveDislikedUp(index)}
                    disabled={index === 0}
                  >
                    ▲
                  </PriorityButton>
                  <PriorityButton
                    onClick={() => moveDislikedDown(index)}
                    disabled={index === dislikedCategories.length - 1}
                  >
                    ▼
                  </PriorityButton>
                  <RemoveButton
                    onClick={() =>
                      removeDislikedCategory(category.categoryId)
                    }
                  >
                    ✕
                  </RemoveButton>
                </ActionButtons>
              </CategoryItem>
            ))
          )}
        </CategoryList>
      </Section>

      <ButtonGroup>
        <SubmitButton
          onClick={handleSubmit}
          disabled={
            loading ||
            (likedCategories.length === 0 && dislikedCategories.length === 0)
          }
        >
          {loading ? "저장 중..." : "다음"}
        </SubmitButton>
      </ButtonGroup>
    </Container>
  );
};

const Container = styled.div\`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: \${theme.spacing.xl};
\`;

const Header = styled.header\`
  background-color: white;
  padding: \${theme.spacing.md} \${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
\`;

const Title = styled.h1\`
  font-size: \${theme.typography.fontSize.lg};
  font-weight: \${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  text-align: center;
\`;

const Section = styled.section\`
  padding: \${theme.spacing.lg};
\`;

const SectionTitle = styled.h2\`
  font-size: \${theme.typography.fontSize.lg};
  font-weight: \${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 \${theme.spacing.sm} 0;
\`;

const SectionDescription = styled.p\`
  font-size: \${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0;
  line-height: 1.5;
\`;

const SubTitle = styled.h3\`
  font-size: \${theme.typography.fontSize.base};
  font-weight: \${theme.typography.fontWeight.semibold};
  color: #212121;
  margin: 0 0 \${theme.spacing.md} 0;
\`;

const SearchContainer = styled.div\`
  position: relative;
  margin-bottom: \${theme.spacing.md};
\`;

const SearchInput = styled.input\`
  width: 100%;
  padding: \${theme.spacing.md} \${theme.spacing.lg};
  border: 1px solid #e0e0e0;
  border-radius: \${theme.borderRadius.md};
  font-size: \${theme.typography.fontSize.base};
  background-color: white;

  &:focus {
    outline: none;
    border-color: \${theme.colors.accent};
  }

  &::placeholder {
    color: #9e9e9e;
  }
\`;

const SearchDropdown = styled.div\`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 \${theme.borderRadius.md} \${theme.borderRadius.md};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
\`;

const DropdownItem = styled.div\`
  padding: \${theme.spacing.md} \${theme.spacing.lg};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    background-color: #e0e0e0;
  }
\`;

const EmptyDropdown = styled.div\`
  padding: \${theme.spacing.md} \${theme.spacing.lg};
  color: #9e9e9e;
  font-size: \${theme.typography.fontSize.sm};
  text-align: center;
\`;

const CategoryList = styled.div\`
  display: flex;
  flex-direction: column;
  gap: \${theme.spacing.sm};
\`;

const EmptyMessage = styled.p\`
  color: #9e9e9e;
  font-size: \${theme.typography.fontSize.sm};
  text-align: center;
  padding: \${theme.spacing.xl} 0;
  margin: 0;
\`;

const CategoryItem = styled.div<{ \$type: "liked" | "disliked" }>\`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: \${theme.spacing.md};
  background-color: \${(props) =>
    props.\$type === "liked" ? "#fff5f0" : "#fffef0"};
  border: 1px solid
    \${(props) => (props.\$type === "liked" ? "#ffccbc" : "#fff9c4")};
  border-radius: \${theme.borderRadius.md};
\`;

const CategoryInfo = styled.div\`
  display: flex;
  align-items: center;
  gap: \${theme.spacing.md};
  flex: 1;
\`;

const PriorityBadge = styled.div\`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: \${theme.colors.accent};
  color: white;
  border-radius: 50%;
  font-size: \${theme.typography.fontSize.sm};
  font-weight: \${theme.typography.fontWeight.bold};
\`;

const CategoryName = styled.span\`
  font-size: \${theme.typography.fontSize.base};
  font-weight: \${theme.typography.fontWeight.medium};
  color: #212121;
\`;

const ActionButtons = styled.div\`
  display: flex;
  gap: \${theme.spacing.xs};
\`;

const PriorityButton = styled.button\`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: \${theme.borderRadius.sm};
  font-size: \${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
    border-color: \${theme.colors.accent};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
\`;

const RemoveButton = styled.button\`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #ff5252;
  border-radius: \${theme.borderRadius.sm};
  color: #ff5252;
  font-size: \${theme.typography.fontSize.base};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ff5252;
    color: white;
  }
\`;

const ButtonGroup = styled.div\`
  padding: 0 \${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: \${theme.spacing.md};
  margin-top: \${theme.spacing.xl};
\`;

const SubmitButton = styled.button<{ disabled?: boolean }>\`
  width: 100%;
  padding: \${theme.spacing.md};
  background-color: \${(props) =>
    props.disabled ? "#e0e0e0" : theme.colors.accent};
  color: white;
  border: none;
  border-radius: \${theme.borderRadius.md};
  font-size: \${theme.typography.fontSize.lg};
  font-weight: \${theme.typography.fontWeight.semibold};
  cursor: \${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  &:hover {
    background-color: \${(props) => (props.disabled ? "#e0e0e0" : "#e55a2b")};
  }

  &:active {
    transform: \${(props) => (props.disabled ? "none" : "scale(0.98)")};
  }
\`;

export default OnboardingPreferencePage;
