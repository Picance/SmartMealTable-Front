import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiSliders } from "react-icons/fi";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { StoreCard } from "../../components/home/StoreCard";
import { storeService, StoreSearchParams } from "../../services/store.service";
import { categoryService } from "../../services/category.service";
import type { Store, Category } from "../../types/api";
import "./RecommendationPage.css";

type SortBy = "DISTANCE" | "PRICE" | "RATING" | "POPULARITY";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "DISTANCE", label: "가까운 순" },
  { value: "POPULARITY", label: "인기순" },
  { value: "PRICE", label: "저렴한 순" },
  { value: "RATING", label: "평점순" },
];

const RecommendationPage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("DISTANCE");
  const [stores, setStores] = useState<Store[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    searchStores();
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
    setError("");

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
      setError("가게를 불러오는 중 오류가 발생했습니다.");
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchStores();
  };

  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleSortChange = (newSortBy: SortBy) => {
    setSortBy(newSortBy);
    setShowSortMenu(false);
  };

  const handleStoreClick = (storeId: number) => {
    navigate(`/store/${storeId}`);
  };

  const handleFavoriteToggle = async (storeId: number) => {
    try {
      const store = stores.find((s) => s.storeId === storeId);
      if (store?.isFavorite) {
        await storeService.removeFavorite(storeId);
      } else {
        await storeService.addFavorite(storeId);
      }
      // 목록 새로고침
      searchStores();
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
    }
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "정렬";

  return (
    <div className="recommendation-page">
      {/* 헤더 */}
      <div className="recommendation-header">
        <div className="recommendation-header-top">
          <button
            className="recommendation-back-button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
          >
            <FiArrowLeft />
          </button>
          <h1 className="recommendation-header-title">음식 추천</h1>
        </div>

        <div className="recommendation-search-bar">
          <div className="recommendation-search-input">
            <Input
              type="text"
              value={searchKeyword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchKeyword(e.target.value)
              }
              placeholder="가게나 메뉴를 검색하세요"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSearch}
            icon={<FiSearch />}
          >
            검색
          </Button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="recommendation-filters">
        <div
          className={`recommendation-filter-chip ${
            !selectedCategory ? "active" : ""
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          전체
        </div>
        {categories.map((category) => (
          <div
            key={category.categoryId}
            className={`recommendation-filter-chip ${
              selectedCategory === category.categoryId ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category.categoryId)}
          >
            {category.categoryName}
          </div>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="recommendation-content">
        {error && <div className="recommendation-error">{error}</div>}

        {/* 정렬 바 */}
        <div className="recommendation-sort-bar">
          <div className="recommendation-result-count">
            총{" "}
            <span className="recommendation-result-count-number">
              {totalCount}
            </span>
            개의 가게
          </div>
          <div style={{ position: "relative" }}>
            <button
              className="recommendation-sort-button"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              {currentSortLabel}
              <FiSliders />
            </button>
            {showSortMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "0.5rem",
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  zIndex: 10,
                  minWidth: "120px",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: sortBy === option.value ? "#ff6b35" : "#333",
                      fontWeight: sortBy === option.value ? 600 : 400,
                      borderBottom: "1px solid #f5f5f5",
                    }}
                    onClick={() => handleSortChange(option.value)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f9f9f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 가게 목록 */}
        {isLoading ? (
          <div className="recommendation-loading">
            <div className="recommendation-loading-spinner" />
            <p>검색 중...</p>
          </div>
        ) : stores.length > 0 ? (
          <div className="recommendation-store-list">
            {stores.map((store) => (
              <StoreCard
                key={store.storeId}
                store={store}
                onClick={() => handleStoreClick(store.storeId)}
                onFavoriteClick={() => handleFavoriteToggle(store.storeId)}
              />
            ))}
          </div>
        ) : (
          <div className="recommendation-empty">
            <div className="recommendation-empty-icon">🔍</div>
            <p className="recommendation-empty-text">검색 결과가 없습니다</p>
            <p className="recommendation-empty-subtext">
              다른 검색어나 필터를 사용해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationPage;
