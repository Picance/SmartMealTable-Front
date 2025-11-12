import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft, FiSearch } from "react-icons/fi";

const FoodPreferencePage = () => {
  const navigate = useNavigate();

  // 선호 카테고리
  const [likedCategories, setLikedCategories] = useState<string[]>([
    "한식",
    "중식",
    "양식",
  ]);

  // 불호 카테고리
  const [dislikedCategories, setDislikedCategories] = useState<string[]>([
    "해산물",
    "매운 음식",
    "달콤한 음식",
  ]);

  // 사용 가능한 카테고리 목록
  const availableCategories = [
    "일식",
    "이탈리안",
    "베트남",
    "인도",
    "멕시칸",
    "태국",
    "퓨전",
    "프랑스",
    "치킨",
    "지중해",
    "건강식",
    "스낵",
    "디저트",
    "중동",
    "뷔페",
  ];

  // 검색어
  const [searchQuery, setSearchQuery] = useState("");

  // 필터링된 카테고리
  const filteredCategories = availableCategories.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 카테고리 추가/제거
  const toggleLikedCategory = (category: string) => {
    if (likedCategories.includes(category)) {
      setLikedCategories(likedCategories.filter((c) => c !== category));
    } else {
      setLikedCategories([...likedCategories, category]);
      // 불호에서 제거
      setDislikedCategories(dislikedCategories.filter((c) => c !== category));
    }
  };

  const toggleDislikedCategory = (category: string) => {
    if (dislikedCategories.includes(category)) {
      setDislikedCategories(dislikedCategories.filter((c) => c !== category));
    } else {
      setDislikedCategories([...dislikedCategories, category]);
      // 선호에서 제거
      setLikedCategories(likedCategories.filter((c) => c !== category));
    }
  };

  const handleAvailableCategoryClick = (category: string) => {
    // 기본적으로 선호에 추가
    if (
      !likedCategories.includes(category) &&
      !dislikedCategories.includes(category)
    ) {
      setLikedCategories([...likedCategories, category]);
    }
  };

  // 저장
  const handleSave = () => {
    // TODO: API 호출
    alert("음식 취향이 저장되었습니다.");
    navigate("/profile");
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

        {/* 선호하는 음식 카테고리 */}
        <Section>
          <SectionTitle>선호하는 음식 카테고리 (무선순위 순서)</SectionTitle>
          <CategoryList>
            {likedCategories.map((category) => (
              <CategoryChip
                key={category}
                color="orange"
                onClick={() => toggleLikedCategory(category)}
              >
                {category}
              </CategoryChip>
            ))}
          </CategoryList>
        </Section>

        {/* 불호하는 음식 카테고리 */}
        <Section>
          <SectionTitle>불호하는 음식 카테고리 (무선순위 순서)</SectionTitle>
          <CategoryList>
            {dislikedCategories.map((category) => (
              <CategoryChip
                key={category}
                color="yellow"
                onClick={() => toggleDislikedCategory(category)}
              >
                {category}
              </CategoryChip>
            ))}
          </CategoryList>
        </Section>

        {/* 드래그 앤 드롭 섹션 */}
        <Section>
          <SectionTitle>드래그 앤 드롭으로 지정해주세요</SectionTitle>

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
              const isLiked = likedCategories.includes(category);
              const isDisliked = dislikedCategories.includes(category);

              return (
                <CategoryButton
                  key={category}
                  $selected={isLiked || isDisliked}
                  onClick={() => handleAvailableCategoryClick(category)}
                >
                  ☰ {category}
                </CategoryButton>
              );
            })}
          </CategoryGrid>
        </Section>

        {/* 저장 버튼 */}
        <SaveButton onClick={handleSave}>저장하기</SaveButton>
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
  text-align: center;

  &:hover {
    background-color: #f5f5f5;
    border-color: ${theme.colors.accent};
  }

  &:active {
    transform: scale(0.98);
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
