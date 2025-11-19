import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiTag,
  FiChevronDown,
} from "react-icons/fi";
import { useCartStore } from "../../store/cartStore";
import BottomNav from "../../components/layout/BottomNav";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "OTHER";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    budgetInfo,
    fetchCart,
    updateQuantity,
    removeItem,
    checkout,
    getTotalPrice,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("BREAKFAST");
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // 컴포넌트 마운트 시 장바구니 조회
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 백엔드에서 제공하는 예산 정보 사용
  const totalCartPrice = getTotalPrice();

  const mealTypeOptions = [
    { value: "BREAKFAST" as MealType, label: "아침" },
    { value: "LUNCH" as MealType, label: "점심" },
    { value: "DINNER" as MealType, label: "저녁" },
    { value: "SNACK" as MealType, label: "간식" },
    { value: "OTHER" as MealType, label: "기타" },
  ];

  const handleQuantityChange = async (
    cartItemId: number,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      await updateQuantity(cartItemId, newQuantity);
    } else if (newQuantity < 1) {
      await removeItem(cartItemId);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await checkout(selectedMealType);

      // 체크아웃 성공 → 지출 등록 완료 페이지로 이동
      navigate("/spending/success", {
        state: {
          expenditureData: {
            expenditureId: response.expenditureId,
            storeName: response.storeName,
            items: response.items,
            totalAmount: response.finalAmount,
            mealType: response.mealType,
            expendedDate: response.expendedDate,
            expendedTime: response.expendedTime,
            budgetSummary: response.budgetSummary,
          },
        },
      });
    } catch (error: any) {
      alert(error.message || "체크아웃 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getMealTypeLabel = () => {
    return (
      mealTypeOptions.find((opt) => opt.value === selectedMealType)?.label ||
      "아침"
    );
  };

  if (items.length === 0) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <FiArrowLeft size={24} />
          </BackButton>
          <Title>장바구니</Title>
          <Placeholder />
        </Header>

        <EmptyContainer>
          <EmptyIcon>🛒</EmptyIcon>
          <EmptyText>장바구니가 비어있습니다</EmptyText>
          <EmptyButton onClick={() => navigate("/recommendation")}>
            메뉴 둘러보기
          </EmptyButton>
        </EmptyContainer>

        <BottomNav />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} />
        </BackButton>
        <Title>장바구니</Title>
        <Placeholder />
      </Header>

      <Content>
        {/* 장바구니 아이템 리스트 */}
        <CartItemList>
          {items.map((item) => (
            <CartItem key={item.cartItemId}>
              <ItemImage
                src={item.imageUrl || "/placeholder-menu.jpg"}
                alt={item.foodName}
              />
              <ItemInfo>
                <ItemName>{item.foodName}</ItemName>
                <ItemPrice>
                  {(item.price || item.averagePrice || 0).toLocaleString()}원 /
                  개
                </ItemPrice>
                <ItemTotalPrice>
                  {(item.totalPrice || item.subtotal || 0).toLocaleString()}원
                </ItemTotalPrice>
              </ItemInfo>
              <ItemControls>
                <QuantityControl>
                  <QuantityButton
                    onClick={() =>
                      handleQuantityChange(item.cartItemId, item.quantity, -1)
                    }
                  >
                    <FiMinus size={16} />
                  </QuantityButton>
                  <QuantityDisplay>{item.quantity}</QuantityDisplay>
                  <QuantityButton
                    onClick={() =>
                      handleQuantityChange(item.cartItemId, item.quantity, 1)
                    }
                  >
                    <FiPlus size={16} />
                  </QuantityButton>
                </QuantityControl>
                <DeleteButton onClick={() => removeItem(item.cartItemId)}>
                  <FiTrash2 size={20} color="#ff4444" />
                </DeleteButton>
              </ItemControls>
            </CartItem>
          ))}
        </CartItemList>

        {/* 할인 쿠폰 입력 */}
        <CouponSection>
          <CouponInput>
            <FiTag size={20} color="#666" />
            <input
              type="text"
              placeholder="할인 쿠폰 입력"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </CouponInput>
        </CouponSection>

        {/* 식사 유형 선택 */}
        <MealTypeSection
          onClick={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
        >
          <MealTypeLabel>식사 유형: {getMealTypeLabel()}</MealTypeLabel>
          <FiChevronDown size={20} />
          {showMealTypeDropdown && (
            <MealTypeDropdown onClick={(e) => e.stopPropagation()}>
              {mealTypeOptions.map((option) => (
                <MealTypeOption
                  key={option.value}
                  $active={selectedMealType === option.value}
                  onClick={() => {
                    setSelectedMealType(option.value);
                    setShowMealTypeDropdown(false);
                  }}
                >
                  {option.label}
                </MealTypeOption>
              ))}
            </MealTypeDropdown>
          )}
        </MealTypeSection>

        {/* 가격 요약 */}
        <PriceSummary>
          {budgetInfo && (
            <>
              <SummaryRow>
                <SummaryLabel>남은 일일 식비 예산</SummaryLabel>
                <SummaryValue>
                  {budgetInfo.dailyBudgetBefore.toLocaleString()}원
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>남은 {getMealTypeLabel()} 식사 예산</SummaryLabel>
                <SummaryValue>
                  {budgetInfo.mealBudget.toLocaleString()}원
                </SummaryValue>
              </SummaryRow>
              <Divider />
            </>
          )}
          <SummaryRow>
            <SummaryLabel $bold>총 장바구니 금액</SummaryLabel>
            <SummaryValue $bold>
              {totalCartPrice.toLocaleString()}원
            </SummaryValue>
          </SummaryRow>
          {budgetInfo && (
            <>
              <Divider />
              <SummaryRow>
                <SummaryLabel $highlight>구매 후 남은 일일 예산</SummaryLabel>
                <SummaryValue $highlight>
                  {budgetInfo.dailyBudgetAfter.toLocaleString()}원
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel $negative={budgetInfo.isOverBudget}>
                  구매 후 남은 {getMealTypeLabel()} 식사 예산
                </SummaryLabel>
                <SummaryValue $negative={budgetInfo.isOverBudget}>
                  {budgetInfo.monthlyBudgetAfter.toLocaleString()}원
                </SummaryValue>
              </SummaryRow>
              {budgetInfo.isOverBudget && (
                <WarningMessage>⚠️ 예산을 초과했습니다!</WarningMessage>
              )}
            </>
          )}
        </PriceSummary>

        {/* 하단 버튼 */}
        <AddExpenditureButton
          onClick={handleCheckout}
          disabled={isCheckingOut || items.length === 0}
        >
          {isCheckingOut ? "처리 중..." : "식비 지출 내역 추가"}
        </AddExpenditureButton>
      </Content>

      <BottomNav />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0;
`;

const Placeholder = styled.div`
  width: 40px;
`;

const Content = styled.div`
  padding: 16px;
`;

const CartItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
`;

const CartItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #000;
`;

const ItemPrice = styled.div`
  font-size: 13px;
  color: #666;
`;

const ItemTotalPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #000;
  margin-top: auto;
`;

const ItemControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #ccc;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const QuantityDisplay = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #000;
  min-width: 24px;
  text-align: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;

  &:hover {
    opacity: 0.7;
  }
`;

const CouponSection = styled.div`
  margin-bottom: 16px;
`;

const CouponInput = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: #000;

    &::placeholder {
      color: #999;
    }
  }
`;

const MealTypeSection = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const MealTypeLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #000;
`;

const MealTypeDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
`;

const MealTypeOption = styled.div<{ $active: boolean }>`
  padding: 12px 16px;
  font-size: 14px;
  color: ${(props) => (props.$active ? "#ff6b35" : "#000")};
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  background-color: ${(props) => (props.$active ? "#fff5f0" : "#ffffff")};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$active ? "#fff5f0" : "#f9f9f9")};
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const PriceSummary = styled.div`
  padding: 20px 16px;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryLabel = styled.span<{
  $bold?: boolean;
  $highlight?: boolean;
  $negative?: boolean;
}>`
  font-size: 14px;
  color: ${(props) => {
    if (props.$highlight) return "#ff6b35";
    if (props.$negative) return "#ff4444";
    return "#666";
  }};
  font-weight: ${(props) => (props.$bold ? "600" : "400")};
`;

const SummaryValue = styled.span<{
  $bold?: boolean;
  $highlight?: boolean;
  $negative?: boolean;
}>`
  font-size: 15px;
  color: ${(props) => {
    if (props.$highlight) return "#ff6b35";
    if (props.$negative) return "#ff4444";
    return "#000";
  }};
  font-weight: ${(props) =>
    props.$bold || props.$highlight || props.$negative ? "700" : "600"};
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f0f0f0;
  margin: 12px 0;
`;

const WarningMessage = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: #fff3e0;
  border-radius: 8px;
  color: #ff6b35;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const AddExpenditureButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background-color: ${(props) => (props.disabled ? "#ccc" : "#ff6b35")};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#ccc" : "#ff5722")};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "scale(0.98)")};
  }
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
`;

const EmptyButton = styled.button`
  padding: 12px 24px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #ff5722;
  }
`;

export default CartPage;
