import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { onboardingService } from "../../services/onboarding.service";
import type { Food } from "../../types/api";

interface RankedCategory {
  rank: number;
  category: Food | null;
}

const OnboardingFoodPreferencePage = () => {
  const navigate = useNavigate();

  // 음식 카테고리 목록
  const [categories, setCategories] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  // 선호/불호 검색어
  const [preferredSearchTerm, setPreferredSearchTerm] = useState("");
  const [dislikedSearchTerm, setDislikedSearchTerm] = useState("");

  // 선호/불호 우선순위 (1-3순위)
  const [preferredRankings, setPreferredRankings] = useState<RankedCategory[]>([
    { rank: 1, category: null },
    { rank: 2, category: null },
    { rank: 3, category: null },
  ]);
  const [dislikedRankings, setDislikedRankings] = useState<RankedCategory[]>([
    { rank: 1, category: null },
    { rank: 2, category: null },
    { rank: 3, category: null },
  ]);

  // 검색 결과 표시 여부
  const [showPreferredResults, setShowPreferredResults] = useState(false);
  const [showDislikedResults, setShowDislikedResults] = useState(false);

  // 음식 카테고리 목록 조회
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await onboardingService.getFoods(undefined, 0, 100);

      if (response.result === "SUCCESS" && response.data) {
        setCategories(response.data.content);
      }
    } catch (error) {
      console.error("카테고리 목록 조회 실패:", error);
      alert("카테고리 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 검색 필터링
  const getFilteredCategories = (searchTerm: string) => {
    if (!searchTerm.trim()) return [];

    const usedCategoryIds = [
      ...preferredRankings
        .filter((r) => r.category)
        .map((r) => r.category!.foodId),
      ...dislikedRankings
        .filter((r) => r.category)
        .map((r) => r.category!.foodId),
    ];

    return categories.filter(
      (cat) =>
        !usedCategoryIds.includes(cat.foodId) &&
        (cat.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // 선호 카테고리 선택
  const selectPreferredCategory = (rank: number, category: Food) => {
    setPreferredRankings((prev) =>
      prev.map((r) => (r.rank === rank ? { ...r, category } : r))
    );
    setPreferredSearchTerm("");
    setShowPreferredResults(false);
  };

  // 불호 카테고리 선택
  const selectDislikedCategory = (rank: number, category: Food) => {
    setDislikedRankings((prev) =>
      prev.map((r) => (r.rank === rank ? { ...r, category } : r))
    );
    setDislikedSearchTerm("");
    setShowDislikedResults(false);
  };

  // 선호 카테고리 제거
  const removePreferredCategory = (rank: number) => {
    setPreferredRankings((prev) =>
      prev.map((r) => (r.rank === rank ? { ...r, category: null } : r))
    );
  };

  // 불호 카테고리 제거
  const removeDislikedCategory = (rank: number) => {
    setDislikedRankings((prev) =>
      prev.map((r) => (r.rank === rank ? { ...r, category: null } : r))
    );
  };

  // 저장하기
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const preferredFoodIds = preferredRankings
        .filter((r) => r.category !== null)
        .map((r) => r.category!.foodId);

      const response = await onboardingService.saveFoodPreferences({
        preferredFoodIds,
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
          <Title>음식 카테고리 설정</Title>
        </Header>

        {/* 선호하는 음식 카테고리 섹션 */}
        <Section>
          <SectionTitle>선호하는 음식 카테고리 (우선순위 순서)</SectionTitle>
          <SectionDescription>
            완벽한 서비스 제공을 위해 음식 취향을 설정해주세요.
          </SectionDescription>

          {preferredRankings.map((ranking) => (
            <RankingContainer key={`preferred-${ranking.rank}`}>
              <RankLabel>{ranking.rank}순위</RankLabel>
              {ranking.category ? (
                <SelectedCategoryCard>
                  <CategoryImage
                    src={ranking.category.imageUrl}
                    alt={ranking.category.foodName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em'%3E🍽️%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <CategoryInfo>
                    <CategoryName>{ranking.category.foodName}</CategoryName>
                    <CategorySubInfo>
                      {ranking.category.categoryName} ·{" "}
                      {ranking.category.averagePrice.toLocaleString()}원
                    </CategorySubInfo>
                  </CategoryInfo>
                  <RemoveButton
                    onClick={() => removePreferredCategory(ranking.rank)}
                  >
                    ✕
                  </RemoveButton>
                </SelectedCategoryCard>
              ) : (
                <SearchContainer>
                  <SearchInput
                    type="text"
                    placeholder="카테고리 검색..."
                    value={
                      showPreferredResults &&
                      ranking.rank ===
                        preferredRankings.findIndex((r) => !r.category) + 1
                        ? preferredSearchTerm
                        : ""
                    }
                    onChange={(e) => {
                      setPreferredSearchTerm(e.target.value);
                      setShowPreferredResults(true);
                    }}
                    onFocus={() => setShowPreferredResults(true)}
                  />
                  {showPreferredResults &&
                    preferredSearchTerm &&
                    ranking.rank ===
                      preferredRankings.findIndex((r) => !r.category) + 1 && (
                      <SearchResults>
                        {getFilteredCategories(preferredSearchTerm).length >
                        0 ? (
                          getFilteredCategories(preferredSearchTerm)
                            .slice(0, 5)
                            .map((category) => (
                              <SearchResultItem
                                key={category.foodId}
                                onClick={() =>
                                  selectPreferredCategory(
                                    ranking.rank,
                                    category
                                  )
                                }
                              >
                                <CategoryImage
                                  src={category.imageUrl}
                                  alt={category.foodName}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em'%3E🍽️%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                                <CategoryInfo>
                                  <CategoryName>
                                    {category.foodName}
                                  </CategoryName>
                                  <CategorySubInfo>
                                    {category.categoryName} ·{" "}
                                    {category.averagePrice.toLocaleString()}원
                                  </CategorySubInfo>
                                </CategoryInfo>
                              </SearchResultItem>
                            ))
                        ) : (
                          <EmptySearchResult>
                            검색 결과가 없습니다.
                          </EmptySearchResult>
                        )}
                      </SearchResults>
                    )}
                </SearchContainer>
              )}
            </RankingContainer>
          ))}
        </Section>

        {/* 불호하는 음식 카테고리 섹션 */}
        <Section>
          <SectionTitle>불호하는 음식 카테고리 (우선순위 순서)</SectionTitle>
          <SectionDescription>
            완벽한 서비스 제공을 위해 음식 취향을 설정해주세요.
          </SectionDescription>

          {dislikedRankings.map((ranking) => (
            <RankingContainer key={`disliked-${ranking.rank}`}>
              <RankLabel>{ranking.rank}순위</RankLabel>
              {ranking.category ? (
                <SelectedCategoryCard>
                  <CategoryImage
                    src={ranking.category.imageUrl}
                    alt={ranking.category.foodName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em'%3E🍽️%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <CategoryInfo>
                    <CategoryName>{ranking.category.foodName}</CategoryName>
                    <CategorySubInfo>
                      {ranking.category.categoryName} ·{" "}
                      {ranking.category.averagePrice.toLocaleString()}원
                    </CategorySubInfo>
                  </CategoryInfo>
                  <RemoveButton
                    onClick={() => removeDislikedCategory(ranking.rank)}
                  >
                    ✕
                  </RemoveButton>
                </SelectedCategoryCard>
              ) : (
                <SearchContainer>
                  <SearchInput
                    type="text"
                    placeholder="카테고리 검색..."
                    value={
                      showDislikedResults &&
                      ranking.rank ===
                        dislikedRankings.findIndex((r) => !r.category) + 1
                        ? dislikedSearchTerm
                        : ""
                    }
                    onChange={(e) => {
                      setDislikedSearchTerm(e.target.value);
                      setShowDislikedResults(true);
                    }}
                    onFocus={() => setShowDislikedResults(true)}
                  />
                  {showDislikedResults &&
                    dislikedSearchTerm &&
                    ranking.rank ===
                      dislikedRankings.findIndex((r) => !r.category) + 1 && (
                      <SearchResults>
                        {getFilteredCategories(dislikedSearchTerm).length >
                        0 ? (
                          getFilteredCategories(dislikedSearchTerm)
                            .slice(0, 5)
                            .map((category) => (
                              <SearchResultItem
                                key={category.foodId}
                                onClick={() =>
                                  selectDislikedCategory(ranking.rank, category)
                                }
                              >
                                <CategoryImage
                                  src={category.imageUrl}
                                  alt={category.foodName}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em'%3E🍽️%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                                <CategoryInfo>
                                  <CategoryName>
                                    {category.foodName}
                                  </CategoryName>
                                  <CategorySubInfo>
                                    {category.categoryName} ·{" "}
                                    {category.averagePrice.toLocaleString()}원
                                  </CategorySubInfo>
                                </CategoryInfo>
                              </SearchResultItem>
                            ))
                        ) : (
                          <EmptySearchResult>
                            검색 결과가 없습니다.
                          </EmptySearchResult>
                        )}
                      </SearchResults>
                    )}
                </SearchContainer>
              )}
            </RankingContainer>
          ))}
        </Section>

        {loading && (
          <LoadingContainer>
            <LoadingMessage>카테고리를 불러오는 중...</LoadingMessage>
          </LoadingContainer>
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
  padding-bottom: 100px;
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
  background-color: white;
  margin-bottom: ${theme.spacing.md};
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
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.5;
`;

const RankingContainer = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const RankLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.accent};
  margin-bottom: ${theme.spacing.xs};
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing.xs};
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: background-color 0.2s;
  gap: ${theme.spacing.md};

  &:hover {
    background-color: #f5f5f5;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const SelectedCategoryCard = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: #f5f5f5;
  border: 2px solid ${theme.colors.accent};
  border-radius: ${theme.borderRadius.md};
  gap: ${theme.spacing.md};
  position: relative;
`;

const CategoryImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.sm};
  background-color: #e0e0e0;
  flex-shrink: 0;
`;

const CategoryInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  min-width: 0;
`;

const CategoryName = styled.p`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CategorySubInfo = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: #ff5252;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff1744;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const EmptySearchResult = styled.div`
  padding: ${theme.spacing.lg};
  text-align: center;
  color: #9e9e9e;
  font-size: ${theme.typography.fontSize.sm};
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

const ButtonGroup = styled.div`
  position: fixed;
  bottom: 0;
  max-width: 480px;
  width: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: white;
  border-top: 1px solid #e0e0e0;
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
