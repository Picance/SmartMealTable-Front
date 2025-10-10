import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiBell,
  FiSettings,
  FiChevronRight,
  FiSunrise,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { budgetService, BudgetStatus } from "../../services/budget.service";
import { storeService, RecommendedStore } from "../../services/store.service";
import { recommendationService } from "../../services/recommendation.service";
import { BudgetCard } from "../../components/home/BudgetCard";
import { StoreCard } from "../../components/home/StoreCard";
import { MenuCard } from "../../components/home/MenuCard";
import type { RecommendedMenu } from "../../services/recommendation.service";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const member = useAuthStore((state) => state.member);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [recommendedMenus, setRecommendedMenus] = useState<RecommendedMenu[]>(
    []
  );
  const [recommendedStores, setRecommendedStores] = useState<
    RecommendedStore[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 병렬로 데이터 로드
      const [budgetRes, menusRes, storesRes] = await Promise.all([
        budgetService.getBudgetStatus(),
        recommendationService.getPersonalizedMenus({ limit: 10 }),
        storeService.getRecommendedStores(),
      ]);

      if (budgetRes.result === "SUCCESS" && budgetRes.data) {
        setBudgetStatus(budgetRes.data);
      }

      if (menusRes.result === "SUCCESS" && menusRes.data) {
        setRecommendedMenus(menusRes.data);
      }

      if (storesRes.result === "SUCCESS" && storesRes.data) {
        setRecommendedStores(storesRes.data);
      }
    } catch (err: any) {
      console.error("데이터 로드 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreClick = (storeId: number) => {
    navigate(`/store/${storeId}`);
  };

  const handleFavoriteToggle = async (storeId: number) => {
    try {
      const store = recommendedStores.find((s) => s.storeId === storeId);
      if (store?.isFavorite) {
        await storeService.removeFavorite(storeId);
      } else {
        await storeService.addFavorite(storeId);
      }
      // 목록 새로고침
      loadData();
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-loading">
          <div className="home-loading-spinner" />
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* 헤더 */}
      <div className="home-header">
        <div className="home-header-top">
          <h1 className="home-header-greeting">
            안녕하세요,
            <br />
            <span className="home-header-greeting-name">
              {member?.nickname || member?.name}님
            </span>
          </h1>
          <div className="home-header-icons">
            <button
              className="home-header-icon-button"
              onClick={() => navigate("/notifications")}
            >
              <FiBell />
            </button>
            <button
              className="home-header-icon-button"
              onClick={() => navigate("/settings")}
            >
              <FiSettings />
            </button>
          </div>
        </div>
        <div
          className="home-header-location"
          onClick={() => navigate("/address")}
        >
          <FiMapPin />
          <span>현재 위치</span>
          <FiChevronRight style={{ fontSize: "0.75rem" }} />
        </div>
      </div>

      <div className="home-content">
        {error && <div className="home-error">{error}</div>}

        {/* 예산 현황 */}
        {budgetStatus && (
          <div className="home-budget-section">
            <div className="home-budget-grid">
              <BudgetCard
                title="오늘의 예산"
                budget={budgetStatus.dailyBudget}
                spent={budgetStatus.dailySpent}
                remaining={budgetStatus.dailyRemaining}
                variant="primary"
              />
            </div>

            <div className="home-meal-budgets">
              <BudgetCard
                title="아침"
                budget={budgetStatus.mealBudgets.BREAKFAST.budget}
                spent={budgetStatus.mealBudgets.BREAKFAST.spent}
                remaining={budgetStatus.mealBudgets.BREAKFAST.remaining}
                icon={<FiSunrise />}
                variant="secondary"
              />
              <BudgetCard
                title="점심"
                budget={budgetStatus.mealBudgets.LUNCH.budget}
                spent={budgetStatus.mealBudgets.LUNCH.spent}
                remaining={budgetStatus.mealBudgets.LUNCH.remaining}
                icon={<FiSun />}
                variant="secondary"
              />
              <BudgetCard
                title="저녁"
                budget={budgetStatus.mealBudgets.DINNER.budget}
                spent={budgetStatus.mealBudgets.DINNER.spent}
                remaining={budgetStatus.mealBudgets.DINNER.remaining}
                icon={<FiMoon />}
                variant="secondary"
              />
            </div>
          </div>
        )}

        {/* 추천 메뉴 */}
        <div className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">오늘의 추천 메뉴</h2>
            <a
              href="#"
              className="home-section-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/recommendation");
              }}
            >
              전체보기 <FiChevronRight />
            </a>
          </div>

          {recommendedMenus.length > 0 ? (
            <div className="home-menu-scroll">
              {recommendedMenus.map((menu) => (
                <MenuCard
                  key={menu.menuId}
                  menuName={menu.menuName}
                  price={menu.price}
                  imageUrl={menu.imageUrl}
                  storeName={menu.storeName}
                  distance={menu.distance}
                  recommendationReason={menu.recommendationReason}
                  onClick={() => handleStoreClick(menu.storeId)}
                />
              ))}
            </div>
          ) : (
            <div className="home-empty">
              <div className="home-empty-icon">🍽️</div>
              <p className="home-empty-text">추천할 메뉴가 없습니다</p>
            </div>
          )}
        </div>

        {/* 추천 가게 */}
        <div className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">근처 맛집</h2>
            <a
              href="#"
              className="home-section-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/recommendation");
              }}
            >
              전체보기 <FiChevronRight />
            </a>
          </div>

          {recommendedStores.length > 0 ? (
            <div className="home-store-grid">
              {recommendedStores.slice(0, 6).map((store) => (
                <StoreCard
                  key={store.storeId}
                  store={store}
                  onClick={() => handleStoreClick(store.storeId)}
                  onFavoriteClick={() => handleFavoriteToggle(store.storeId)}
                />
              ))}
            </div>
          ) : (
            <div className="home-empty">
              <div className="home-empty-icon">🏪</div>
              <p className="home-empty-text">추천할 가게가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
