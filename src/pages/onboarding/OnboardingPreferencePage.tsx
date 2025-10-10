import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { Button } from "../../components/common/Button";
import { onboardingService } from "../../services/onboarding.service";
import { categoryService } from "../../services/category.service";
import type { Category, Food } from "../../types/api";
import "./OnboardingPreferencePage.css";

type RecommendationType = "SAVER" | "ADVENTURER" | "BALANCED";
type PreferenceWeight = 100 | 0 | -100;

const OnboardingPreferencePage = () => {
  const navigate = useNavigate();
  const [recommendationType, setRecommendationType] =
    useState<RecommendationType>("BALANCED");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<
    Map<number, PreferenceWeight>
  >(new Map());
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [categoriesRes, foodsRes] = await Promise.all([
        categoryService.getCategories(),
        categoryService.getAllFoods(),
      ]);

      if (categoriesRes.result === "SUCCESS" && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (foodsRes.result === "SUCCESS" && foodsRes.data) {
        setFoods(foodsRes.data);
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 선호도 설정
  const handleCategoryPreference = (
    categoryId: number,
    weight: PreferenceWeight
  ) => {
    const newPreferences = new Map(categoryPreferences);
    if (newPreferences.get(categoryId) === weight) {
      // 같은 버튼 클릭 시 취소
      newPreferences.delete(categoryId);
    } else {
      newPreferences.set(categoryId, weight);
    }
    setCategoryPreferences(newPreferences);
  };

  // 음식 선택/해제
  const handleFoodSelection = (foodId: number) => {
    const newSelected = new Set(selectedFoodIds);
    if (newSelected.has(foodId)) {
      newSelected.delete(foodId);
    } else {
      newSelected.add(foodId);
    }
    setSelectedFoodIds(newSelected);
  };

  // 다음 단계로
  const handleNext = async () => {
    setError("");

    // 카테고리 선호도가 하나도 없으면 경고
    if (categoryPreferences.size === 0) {
      setError("최소 1개 이상의 카테고리 선호도를 설정해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. 카테고리 선호도 저장
      const preferences = Array.from(categoryPreferences.entries()).map(
        ([categoryId, weight]) => ({
          categoryId,
          weight,
        })
      );

      const preferencesRes = await onboardingService.savePreferences({
        recommendationType,
        preferences,
      });

      if (preferencesRes.result !== "SUCCESS") {
        throw new Error(
          preferencesRes.error?.message || "취향 설정 저장에 실패했습니다."
        );
      }

      // 2. 선택한 음식 저장 (선택 사항)
      if (selectedFoodIds.size > 0) {
        const foodPreferencesRes = await onboardingService.saveFoodPreferences({
          preferredFoodIds: Array.from(selectedFoodIds),
        });

        if (foodPreferencesRes.result !== "SUCCESS") {
          console.warn("음식 선호도 저장 실패:", foodPreferencesRes.error);
        }
      }

      // 다음 단계로 이동
      navigate("/onboarding/policy");
    } catch (err: any) {
      console.error("취향 설정 저장 실패:", err);
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "취향 설정 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="onboarding-preference-page">
        <div className="onboarding-preference-header">
          <button
            className="onboarding-preference-back-button"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
          </button>
          <h1>취향 설정</h1>
        </div>
        <div className="onboarding-preference-loading">
          <div className="onboarding-preference-loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-preference-page">
      <div className="onboarding-preference-header">
        <button
          className="onboarding-preference-back-button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <FiArrowLeft />
        </button>
        <h1>취향 설정</h1>
      </div>

      <div className="onboarding-preference-content">
        <div className="onboarding-preference-intro">
          <h2>음식 취향을 알려주세요 🍽️</h2>
          <p>더 정확한 맞춤 추천을 위해 음식 취향을 설정합니다.</p>
        </div>

        <form
          className="onboarding-preference-form"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* 추천 유형 선택 */}
          <div className="onboarding-preference-section">
            <h3 className="onboarding-preference-section-title">추천 유형</h3>
            <p className="onboarding-preference-section-description">
              원하는 추천 스타일을 선택해주세요.
            </p>
            <div className="onboarding-preference-type-selector">
              <div
                className={`onboarding-preference-type-card ${
                  recommendationType === "SAVER" ? "active" : ""
                }`}
                onClick={() => setRecommendationType("SAVER")}
              >
                <div className="onboarding-preference-type-icon">💰</div>
                <div className="onboarding-preference-type-name">알뜰형</div>
                <div className="onboarding-preference-type-description">
                  예산 내에서 가성비 좋은 메뉴 추천
                </div>
              </div>

              <div
                className={`onboarding-preference-type-card ${
                  recommendationType === "BALANCED" ? "active" : ""
                }`}
                onClick={() => setRecommendationType("BALANCED")}
              >
                <div className="onboarding-preference-type-icon">⚖️</div>
                <div className="onboarding-preference-type-name">균형형</div>
                <div className="onboarding-preference-type-description">
                  가성비와 다양성을 고려한 추천
                </div>
              </div>

              <div
                className={`onboarding-preference-type-card ${
                  recommendationType === "ADVENTURER" ? "active" : ""
                }`}
                onClick={() => setRecommendationType("ADVENTURER")}
              >
                <div className="onboarding-preference-type-icon">🎯</div>
                <div className="onboarding-preference-type-name">모험가형</div>
                <div className="onboarding-preference-type-description">
                  새로운 음식과 맛집 탐험 추천
                </div>
              </div>
            </div>
          </div>

          {/* 카테고리 선호도 */}
          <div className="onboarding-preference-section">
            <h3 className="onboarding-preference-section-title">
              카테고리 선호도 *
            </h3>
            <p className="onboarding-preference-section-description">
              좋아하거나 싫어하는 음식 카테고리를 선택해주세요.
            </p>
            <div className="onboarding-preference-category-grid">
              {categories.map((category) => {
                const preference = categoryPreferences.get(category.categoryId);
                return (
                  <div
                    key={category.categoryId}
                    className={`onboarding-preference-category-card ${
                      preference === 100
                        ? "like"
                        : preference === -100
                        ? "dislike"
                        : ""
                    }`}
                  >
                    {preference && (
                      <div
                        className={`onboarding-preference-category-badge ${
                          preference === 100 ? "like" : "dislike"
                        }`}
                      >
                        {preference === 100 ? "👍" : "👎"}
                      </div>
                    )}
                    <img
                      src={category.imageUrl || "/placeholder-food.png"}
                      alt={category.categoryName}
                      className="onboarding-preference-category-image"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-food.png";
                      }}
                    />
                    <div className="onboarding-preference-category-name">
                      {category.categoryName}
                    </div>
                    <div className="onboarding-preference-category-actions">
                      <button
                        type="button"
                        className="onboarding-preference-category-action-btn like-btn"
                        onClick={() =>
                          handleCategoryPreference(category.categoryId, 100)
                        }
                      >
                        <FiThumbsUp />
                      </button>
                      <button
                        type="button"
                        className="onboarding-preference-category-action-btn dislike-btn"
                        onClick={() =>
                          handleCategoryPreference(category.categoryId, -100)
                        }
                      >
                        <FiThumbsDown />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 선호 음식 선택 */}
          <div className="onboarding-preference-section">
            <h3 className="onboarding-preference-section-title">
              선호 음식 (선택)
            </h3>
            <p className="onboarding-preference-section-description">
              특별히 좋아하는 음식을 선택해주세요. (최대 20개)
            </p>
            {selectedFoodIds.size > 0 && (
              <div className="onboarding-preference-selected-count">
                선택된 음식: {selectedFoodIds.size}개
              </div>
            )}
            <div className="onboarding-preference-food-grid">
              {foods.slice(0, 30).map((food) => (
                <div
                  key={food.foodId}
                  className={`onboarding-preference-food-card ${
                    selectedFoodIds.has(food.foodId) ? "selected" : ""
                  }`}
                  onClick={() => {
                    if (
                      !selectedFoodIds.has(food.foodId) &&
                      selectedFoodIds.size >= 20
                    ) {
                      return;
                    }
                    handleFoodSelection(food.foodId);
                  }}
                >
                  <img
                    src={food.imageUrl || "/placeholder-food.png"}
                    alt={food.foodName}
                    className="onboarding-preference-food-image"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-food.png";
                    }}
                  />
                  <div className="onboarding-preference-food-name">
                    {food.foodName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="onboarding-preference-error">{error}</div>}

          <div className="onboarding-preference-actions">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleNext}
              disabled={categoryPreferences.size === 0 || isSubmitting}
              loading={isSubmitting}
            >
              다음
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPreferencePage;
