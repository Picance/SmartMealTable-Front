import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiInfo } from "react-icons/fi";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { onboardingService } from "../../services/onboarding.service";
import "./OnboardingBudgetPage.css";

const OnboardingBudgetPage = () => {
  const navigate = useNavigate();
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [breakfastBudget, setBreakfastBudget] = useState("");
  const [lunchBudget, setLunchBudget] = useState("");
  const [dinnerBudget, setDinnerBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 월간 예산 변경 시 일일 예산 자동 계산
  useEffect(() => {
    if (monthlyBudget) {
      const monthly = parseInt(monthlyBudget.replace(/,/g, ""));
      if (!isNaN(monthly)) {
        const daily = Math.floor(monthly / 30);
        setDailyBudget(daily.toLocaleString());
      }
    }
  }, [monthlyBudget]);

  // 일일 예산 변경 시 식사별 예산 자동 분배 (균등 분배)
  useEffect(() => {
    if (dailyBudget && !breakfastBudget && !lunchBudget && !dinnerBudget) {
      const daily = parseInt(dailyBudget.replace(/,/g, ""));
      if (!isNaN(daily)) {
        const perMeal = Math.floor(daily / 3);
        setBreakfastBudget(perMeal.toLocaleString());
        setLunchBudget(perMeal.toLocaleString());
        setDinnerBudget(perMeal.toLocaleString());
      }
    }
  }, [dailyBudget]);

  // 식사별 예산 합계 계산
  const totalMealBudget = () => {
    const breakfast = parseInt(breakfastBudget.replace(/,/g, "")) || 0;
    const lunch = parseInt(lunchBudget.replace(/,/g, "")) || 0;
    const dinner = parseInt(dinnerBudget.replace(/,/g, "")) || 0;
    return breakfast + lunch + dinner;
  };

  // 숫자만 입력 + 천 단위 콤마
  const handleNumberInput = (
    value: string,
    setter: (value: string) => void
  ) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers) {
      const formatted = parseInt(numbers).toLocaleString();
      setter(formatted);
    } else {
      setter("");
    }
  };

  // 다음 단계로
  const handleNext = async () => {
    setError("");

    // 유효성 검사
    const monthly = parseInt(monthlyBudget.replace(/,/g, ""));
    const daily = parseInt(dailyBudget.replace(/,/g, ""));
    const breakfast = parseInt(breakfastBudget.replace(/,/g, ""));
    const lunch = parseInt(lunchBudget.replace(/,/g, ""));
    const dinner = parseInt(dinnerBudget.replace(/,/g, ""));

    if (!monthly || monthly <= 0) {
      setError("월간 예산을 입력해주세요.");
      return;
    }

    if (!daily || daily <= 0) {
      setError("일일 예산을 입력해주세요.");
      return;
    }

    if (!breakfast || !lunch || !dinner) {
      setError("식사별 예산을 모두 입력해주세요.");
      return;
    }

    if (breakfast <= 0 || lunch <= 0 || dinner <= 0) {
      setError("식사별 예산은 0원보다 커야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onboardingService.saveBudget({
        monthlyBudget: monthly,
        dailyBudget: daily,
        mealBudgets: {
          BREAKFAST: breakfast,
          LUNCH: lunch,
          DINNER: dinner,
        },
      });

      if (response.result === "SUCCESS") {
        navigate("/onboarding/preference");
      } else {
        setError(response.error?.message || "예산 저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("예산 저장 실패:", err);
      setError(
        err.response?.data?.error?.message ||
          "예산 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-budget-page">
      <div className="onboarding-budget-header">
        <button
          className="onboarding-budget-back-button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <FiArrowLeft />
        </button>
        <h1>예산 설정</h1>
      </div>

      <div className="onboarding-budget-content">
        <div className="onboarding-budget-intro">
          <h2>식비 예산을 설정해주세요 💰</h2>
          <p>합리적인 소비를 위해 월간 및 일일 예산을 설정합니다.</p>
        </div>

        <form
          className="onboarding-budget-form"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* 월간 예산 */}
          <div className="onboarding-budget-form-section">
            <label className="onboarding-budget-form-label">
              월간 식비 예산 *
            </label>
            <div className="onboarding-budget-input-wrapper">
              <Input
                type="text"
                value={monthlyBudget}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleNumberInput(e.target.value, setMonthlyBudget)
                }
                placeholder="300,000"
                className="onboarding-budget-input"
              />
              <span className="onboarding-budget-currency">원</span>
            </div>
          </div>

          {/* 일일 예산 (자동 계산) */}
          <div className="onboarding-budget-form-section">
            <label className="onboarding-budget-form-label">
              일일 식비 예산 *
            </label>
            <div className="onboarding-budget-input-wrapper">
              <Input
                type="text"
                value={dailyBudget}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleNumberInput(e.target.value, setDailyBudget)
                }
                placeholder="10,000"
                className="onboarding-budget-input"
              />
              <span className="onboarding-budget-currency">원</span>
            </div>
            <div className="onboarding-budget-helper">
              <FiInfo className="onboarding-budget-helper-icon" />
              <span>
                월간 예산 ÷ 30일로 자동 계산됩니다. 직접 수정도 가능합니다.
              </span>
            </div>
          </div>

          {/* 식사별 예산 */}
          <div className="onboarding-budget-form-section">
            <label className="onboarding-budget-form-label">
              식사별 예산 *
            </label>
            <div className="onboarding-budget-meal-grid">
              {/* 아침 */}
              <div className="onboarding-budget-meal-card active">
                <div className="onboarding-budget-meal-card-icon">🌅</div>
                <div className="onboarding-budget-meal-card-label">아침</div>
                <div className="onboarding-budget-meal-card-input">
                  <div className="onboarding-budget-input-wrapper">
                    <Input
                      type="text"
                      value={breakfastBudget}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleNumberInput(e.target.value, setBreakfastBudget)
                      }
                      placeholder="3,000"
                    />
                    <span className="onboarding-budget-currency">원</span>
                  </div>
                </div>
              </div>

              {/* 점심 */}
              <div className="onboarding-budget-meal-card active">
                <div className="onboarding-budget-meal-card-icon">☀️</div>
                <div className="onboarding-budget-meal-card-label">점심</div>
                <div className="onboarding-budget-meal-card-input">
                  <div className="onboarding-budget-input-wrapper">
                    <Input
                      type="text"
                      value={lunchBudget}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleNumberInput(e.target.value, setLunchBudget)
                      }
                      placeholder="5,000"
                    />
                    <span className="onboarding-budget-currency">원</span>
                  </div>
                </div>
              </div>

              {/* 저녁 */}
              <div className="onboarding-budget-meal-card active">
                <div className="onboarding-budget-meal-card-icon">🌙</div>
                <div className="onboarding-budget-meal-card-label">저녁</div>
                <div className="onboarding-budget-meal-card-input">
                  <div className="onboarding-budget-input-wrapper">
                    <Input
                      type="text"
                      value={dinnerBudget}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleNumberInput(e.target.value, setDinnerBudget)
                      }
                      placeholder="5,000"
                    />
                    <span className="onboarding-budget-currency">원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 예산 요약 */}
          {monthlyBudget && dailyBudget && (
            <div className="onboarding-budget-summary">
              <div className="onboarding-budget-summary-title">
                설정된 식비 예산
              </div>
              <div className="onboarding-budget-summary-total">
                월 {monthlyBudget}원
              </div>
              <div className="onboarding-budget-summary-breakdown">
                <div className="onboarding-budget-summary-item">
                  <div className="onboarding-budget-summary-item-label">
                    일일 예산
                  </div>
                  <div className="onboarding-budget-summary-item-value">
                    {dailyBudget}원
                  </div>
                </div>
                <div className="onboarding-budget-summary-item">
                  <div className="onboarding-budget-summary-item-label">
                    식사별 합계
                  </div>
                  <div className="onboarding-budget-summary-item-value">
                    {totalMealBudget().toLocaleString()}원
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="onboarding-budget-error">{error}</div>}

          <div className="onboarding-budget-actions">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleNext}
              disabled={
                !monthlyBudget ||
                !dailyBudget ||
                !breakfastBudget ||
                !lunchBudget ||
                !dinnerBudget ||
                isSubmitting
              }
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

export default OnboardingBudgetPage;
