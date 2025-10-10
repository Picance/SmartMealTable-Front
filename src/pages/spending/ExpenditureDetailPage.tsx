import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { expenditureService } from "../../services/expenditure.service";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import type { Expenditure } from "../../types/api";
import "./ExpenditureDetailPage.css";

const ExpenditureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expenditure, setExpenditure] = useState<Expenditure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadExpenditure(parseInt(id));
    }
  }, [id]);

  const loadExpenditure = async (expenditureId: number) => {
    setLoading(true);
    try {
      const response = await expenditureService.getExpenditureDetail(
        expenditureId
      );
      if (response.result === "SUCCESS" && response.data) {
        setExpenditure(response.data);
      }
    } catch (error) {
      console.error("Failed to load expenditure:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expenditure) return;

    if (window.confirm("이 지출 내역을 삭제하시겠습니까?")) {
      try {
        const response = await expenditureService.deleteExpenditure(
          expenditure.expenditureId
        );
        if (response.result === "SUCCESS") {
          alert("삭제되었습니다.");
          navigate("/spending");
        }
      } catch (error) {
        console.error("Failed to delete expenditure:", error);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="expenditure-detail-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!expenditure) {
    return (
      <div className="expenditure-detail-page">
        <div className="error">지출 내역을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const mealTypeLabel = {
    BREAKFAST: "아침",
    LUNCH: "점심",
    DINNER: "저녁",
  }[expenditure.mealType];

  return (
    <div className="expenditure-detail-page">
      <header className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>지출 상세</h1>
        <div className="header-actions">
          <button
            className="edit-button"
            onClick={() =>
              navigate(`/spending/edit/${expenditure.expenditureId}`)
            }
          >
            <FaEdit />
          </button>
          <button className="delete-button" onClick={handleDelete}>
            <FaTrash />
          </button>
        </div>
      </header>

      <div className="detail-content">
        <Card className="amount-card">
          <div className="amount-section">
            <span className="amount-label">지출 금액</span>
            <span className="amount-value">
              {expenditure.amount.toLocaleString()}원
            </span>
          </div>
        </Card>

        <Card className="info-card">
          <h2>기본 정보</h2>

          <div className="info-item">
            <span className="label">가게명</span>
            <span className="value">{expenditure.storeName}</span>
          </div>

          <div className="info-item">
            <span className="label">카테고리</span>
            <span className="value">{expenditure.categoryName}</span>
          </div>

          <div className="info-item">
            <span className="label">식사 시간</span>
            <span className="value">{mealTypeLabel}</span>
          </div>

          <div className="info-item">
            <span className="label">날짜</span>
            <span className="value">{expenditure.expendedDate}</span>
          </div>

          <div className="info-item">
            <span className="label">시간</span>
            <span className="value">{expenditure.expendedTime}</span>
          </div>

          {expenditure.memo && (
            <div className="info-item memo-item">
              <span className="label">메모</span>
              <p className="memo-value">{expenditure.memo}</p>
            </div>
          )}
        </Card>

        {expenditure.items && expenditure.items.length > 0 && (
          <Card className="items-card">
            <h2>주문 내역</h2>
            <div className="items-list">
              {expenditure.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.foodName}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-price">
                    {item.totalPrice.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="action-buttons">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/spending/edit/${expenditure.expenditureId}`)
            }
            className="edit-full-button"
          >
            수정하기
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="delete-full-button"
          >
            삭제하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenditureDetailPage;
