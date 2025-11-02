import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { expenditureService } from "../../services/expenditure.service";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import type { Expenditure } from "../../types/api";

type ViewMode = "monthly" | "daily";
type MealFilter = "ALL" | "BREAKFAST" | "LUNCH" | "DINNER";

const SpendingPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{
    totalSpent: number;
    dailyAverage: number;
    mealBreakdown: Record<string, number>;
    dailySpending: Array<{ date: string; amount: number }>;
  } | null>(null);
  const [mealFilter, setMealFilter] = useState<MealFilter>("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewMode === "monthly") {
      loadMonthlyData();
    } else {
      loadDailyData();
    }
  }, [currentDate, viewMode, mealFilter]);

  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // 월별 통계 조회
      const statsResponse = await expenditureService.getMonthlyStats(
        year,
        month
      );
      if (statsResponse.result === "SUCCESS" && statsResponse.data) {
        setMonthlyStats(statsResponse.data);
      }

      // 지출 목록 조회
      const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

      const listResponse = await expenditureService.getExpenditures({
        startDate,
        endDate,
        mealType: mealFilter === "ALL" ? undefined : mealFilter,
      });

      if (listResponse.result === "SUCCESS" && listResponse.data) {
        setExpenditures(listResponse.data);
      }
    } catch (error) {
      console.error("Failed to load monthly data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyData = async () => {
    setLoading(true);
    try {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const response = await expenditureService.getDailyStats(dateStr);

      if (response.result === "SUCCESS" && response.data) {
        setExpenditures(response.data.expenditures);
      }
    } catch (error) {
      console.error("Failed to load daily data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPeriod = () => {
    if (viewMode === "monthly") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === "monthly") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const filteredExpenditures =
    mealFilter === "ALL"
      ? expenditures
      : expenditures.filter((exp) => exp.mealType === mealFilter);

  const totalAmount = filteredExpenditures.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  return (
    <div className="spending-page">
      {/* 헤더 */}
      <header className="spending-header">
        <h1>지출 내역</h1>
        <button
          className="add-button"
          onClick={() => navigate("/spending/create")}
        >
          <FaPlus />
        </button>
      </header>

      {/* 기간 선택 */}
      <div className="period-selector">
        <button className="nav-button" onClick={handlePrevPeriod}>
          ◀
        </button>
        <div className="period-display">
          {viewMode === "monthly"
            ? format(currentDate, "yyyy년 MM월", { locale: ko })
            : format(currentDate, "yyyy년 MM월 dd일", { locale: ko })}
        </div>
        <button className="nav-button" onClick={handleNextPeriod}>
          ▶
        </button>
        <button className="today-button" onClick={handleToday}>
          오늘
        </button>
      </div>

      {/* 뷰 모드 전환 */}
      <div className="view-mode-toggle">
        <button
          className={`mode-button ${viewMode === "monthly" ? "active" : ""}`}
          onClick={() => setViewMode("monthly")}
        >
          월별
        </button>
        <button
          className={`mode-button ${viewMode === "daily" ? "active" : ""}`}
          onClick={() => setViewMode("daily")}
        >
          일별
        </button>
      </div>

      {/* 월별 통계 */}
      {viewMode === "monthly" && monthlyStats && (
        <Card className="stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">총 지출</span>
              <span className="stat-value">
                {monthlyStats.totalSpent.toLocaleString()}원
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">일평균</span>
              <span className="stat-value">
                {Math.round(monthlyStats.dailyAverage).toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="meal-breakdown">
            <h3>식사별 지출</h3>
            <div className="meal-bars">
              {Object.entries(monthlyStats.mealBreakdown).map(
                ([meal, amount]) => {
                  const percentage =
                    monthlyStats.totalSpent > 0
                      ? (amount / monthlyStats.totalSpent) * 100
                      : 0;
                  const mealLabel =
                    {
                      BREAKFAST: "아침",
                      LUNCH: "점심",
                      DINNER: "저녁",
                      SNACK: "간식",
                    }[meal] || meal;

                  return (
                    <div key={meal} className="meal-bar">
                      <div className="meal-bar-label">
                        <span>{mealLabel}</span>
                        <span>{amount.toLocaleString()}원</span>
                      </div>
                      <div className="meal-bar-track">
                        <div
                          className={`meal-bar-fill ${meal.toLowerCase()}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 필터 */}
      <div className="filters">
        <div className="meal-filters">
          {(["ALL", "BREAKFAST", "LUNCH", "DINNER"] as MealFilter[]).map(
            (meal) => (
              <button
                key={meal}
                className={`filter-button ${
                  mealFilter === meal ? "active" : ""
                }`}
                onClick={() => setMealFilter(meal)}
              >
                {meal === "ALL"
                  ? "전체"
                  : meal === "BREAKFAST"
                  ? "아침"
                  : meal === "LUNCH"
                  ? "점심"
                  : "저녁"}
              </button>
            )
          )}
        </div>
      </div>

      {/* 지출 목록 */}
      <div className="expenditure-list">
        <div className="list-header">
          <h2>지출 목록</h2>
          <span className="total-amount">{totalAmount.toLocaleString()}원</span>
        </div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : filteredExpenditures.length === 0 ? (
          <div className="empty-state">
            <p>지출 내역이 없습니다</p>
            <Button
              variant="primary"
              onClick={() => navigate("/spending/create")}
            >
              지출 등록하기
            </Button>
          </div>
        ) : (
          filteredExpenditures.map((expenditure) => (
            <Card
              key={expenditure.expenditureId}
              className="expenditure-item"
              onClick={() => navigate(`/spending/${expenditure.expenditureId}`)}
            >
              <div className="expenditure-header">
                <div className="expenditure-info">
                  <h3 className="store-name">{expenditure.storeName}</h3>
                  <span className="category-badge">
                    {expenditure.categoryName}
                  </span>
                </div>
                <span className="amount">
                  {expenditure.amount.toLocaleString()}원
                </span>
              </div>

              <div className="expenditure-meta">
                <span className="meal-type">
                  {expenditure.mealType === "BREAKFAST"
                    ? "아침"
                    : expenditure.mealType === "LUNCH"
                    ? "점심"
                    : "저녁"}
                </span>
                <span className="date-time">
                  {expenditure.expendedDate} {expenditure.expendedTime}
                </span>
              </div>

              {expenditure.memo && <p className="memo">{expenditure.memo}</p>}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SpendingPage;
