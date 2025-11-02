import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { format } from "date-fns";
import { expenditureService } from "../../services/expenditure.service";
import { categoryService } from "../../services/category.service";
import { useCartStore, CartItem } from "../../store/cartStore";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Card } from "../../components/common/Card";
import type { Category } from "../../types/api";

const CreateExpenditurePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCartStore();
  const cartItems = location.state?.cartItems as CartItem[] | undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    storeName: cartItems?.[0]?.storeName || "",
    amount: cartItems
      ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : 0,
    expendedDate: format(new Date(), "yyyy-MM-dd"),
    expendedTime: format(new Date(), "HH:mm"),
    categoryId: 0,
    mealType: "LUNCH" as "BREAKFAST" | "LUNCH" | "DINNER",
    memo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.result === "SUCCESS" && response.data) {
        const categoriesData = response.data;
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            categoryId: categoriesData[0].categoryId,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeName) {
      alert("가게명을 입력해주세요.");
      return;
    }

    if (formData.amount <= 0) {
      alert("금액을 입력해주세요.");
      return;
    }

    if (formData.categoryId === 0) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await expenditureService.createFromCart({
        storeName: formData.storeName,
        amount: formData.amount,
        expendedDate: formData.expendedDate,
        expendedTime: formData.expendedTime,
        categoryId: formData.categoryId,
        mealType: formData.mealType,
        memo: formData.memo || undefined,
      });

      if (response.result === "SUCCESS") {
        alert("지출이 등록되었습니다.");
        clearCart();
        navigate("/spending");
      }
    } catch (error) {
      console.error("Failed to create expenditure:", error);
      alert("지출 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMealType = (): "BREAKFAST" | "LUNCH" | "DINNER" => {
    const hour = new Date().getHours();
    if (hour < 10) return "BREAKFAST";
    if (hour < 15) return "LUNCH";
    return "DINNER";
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, mealType: getCurrentMealType() }));
  }, []);

  return (
    <div className="create-expenditure-page">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>지출 등록</h1>
        <div className="header-space"></div>
      </header>

      <form onSubmit={handleSubmit} className="expenditure-form">
        <Card className="form-section">
          <h2>기본 정보</h2>

          <Input
            label="가게명"
            value={formData.storeName}
            onChange={(e) => handleChange("storeName", e.target.value)}
            placeholder="가게명을 입력하세요"
            required
          />

          <Input
            label="금액"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange("amount", parseInt(e.target.value))}
            placeholder="금액을 입력하세요"
            required
          />

          <div className="form-row">
            <Input
              label="날짜"
              type="date"
              value={formData.expendedDate}
              onChange={(e) => handleChange("expendedDate", e.target.value)}
              required
            />

            <Input
              label="시간"
              type="time"
              value={formData.expendedTime}
              onChange={(e) => handleChange("expendedTime", e.target.value)}
              required
            />
          </div>
        </Card>

        <Card className="form-section">
          <h2>카테고리</h2>
          <div className="category-grid">
            {categories.map((category) => (
              <button
                key={category.categoryId}
                type="button"
                className={`category-button ${
                  formData.categoryId === category.categoryId ? "active" : ""
                }`}
                onClick={() => handleChange("categoryId", category.categoryId)}
              >
                {category.imageUrl && (
                  <img src={category.imageUrl} alt={category.categoryName} />
                )}
                <span>{category.categoryName}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="form-section">
          <h2>식사 시간</h2>
          <div className="meal-type-buttons">
            <button
              type="button"
              className={`meal-button ${
                formData.mealType === "BREAKFAST" ? "active" : ""
              }`}
              onClick={() => handleChange("mealType", "BREAKFAST")}
            >
              아침
            </button>
            <button
              type="button"
              className={`meal-button ${
                formData.mealType === "LUNCH" ? "active" : ""
              }`}
              onClick={() => handleChange("mealType", "LUNCH")}
            >
              점심
            </button>
            <button
              type="button"
              className={`meal-button ${
                formData.mealType === "DINNER" ? "active" : ""
              }`}
              onClick={() => handleChange("mealType", "DINNER")}
            >
              저녁
            </button>
          </div>
        </Card>

        <Card className="form-section">
          <h2>메모 (선택)</h2>
          <textarea
            className="memo-textarea"
            value={formData.memo}
            onChange={(e) => handleChange("memo", e.target.value)}
            placeholder="메모를 입력하세요"
            rows={4}
          />
        </Card>

        {cartItems && cartItems.length > 0 && (
          <Card className="form-section">
            <h2>주문 내역</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.foodId} className="order-item">
                  <span className="item-name">{item.foodName}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                  <span className="item-price">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={loading}
            className="submit-button"
          >
            {loading ? "등록 중..." : "등록하기"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateExpenditurePage;
