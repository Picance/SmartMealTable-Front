import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheckCircle,
  FiMinus,
  FiPlus,
  FiShare2,
  FiShoppingCart,
} from "react-icons/fi";
import { useCartStore } from "../../store/cartStore";
import type { Menu } from "../../types/api";

const MenuDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, addItem, getTotalPrice } = useCartStore();

  // location.state에서 메뉴 정보 가져오기
  const menu = location.state?.menu as Menu;
  const storeName = location.state?.storeName as string;
  const storeId = location.state?.storeId as number;

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);

  if (!menu) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorText>메뉴 정보를 불러올 수 없습니다.</ErrorText>
          <ErrorButton onClick={() => navigate(-1)}>돌아가기</ErrorButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  const totalPrice = menu.price * quantity;
  const cartTotal = getTotalPrice();

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!storeId || !storeName) {
      alert("가게 정보가 없습니다.");
      return;
    }

    setIsAddingToCart(true);
    try {
      console.log("[MenuDetailPage] 장바구니 추가 시작:", {
        storeId,
        storeName,
        foodId: menu.foodId,
        foodName: menu.foodName,
        quantity,
      });

      const result = await addItem(
        storeId,
        menu.foodId,
        menu.foodName,
        menu.price,
        quantity,
        menu.imageUrl
      );

      console.log(
        "[MenuDetailPage] addItem 결과:",
        JSON.stringify(result, null, 2)
      );
      console.log("[MenuDetailPage] result.success:", result.success);
      console.log("[MenuDetailPage] result.conflict:", result.conflict);

      if (result.success) {
        console.log("[MenuDetailPage] 장바구니 추가 성공");
        // 성공 메시지를 모달로 표시
        setConflictData({ success: true });
        setShowConflictModal(true);
      } else if (result.conflict) {
        // 409 Conflict: 다른 가게 상품이 있을 때
        console.log("[MenuDetailPage] Conflict 발생, 모달 표시");
        console.log(
          "[MenuDetailPage] Conflict 데이터:",
          JSON.stringify(result.conflict, null, 2)
        );

        setConflictData(result.conflict);
        setShowConflictModal(true);
      } else {
        console.log("[MenuDetailPage] 알 수 없는 실패");
        alert("장바구니 추가에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("[MenuDetailPage] handleAddToCart 에러:", error);
      alert(error.message || "장바구니 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleReplaceCart = async () => {
    if (!storeId) return;

    setShowConflictModal(false);
    setIsAddingToCart(true);

    try {
      console.log("[MenuDetailPage] replaceCart=true로 재시도");
      const retryResult = await addItem(
        storeId,
        menu.foodId,
        menu.foodName,
        menu.price,
        quantity,
        menu.imageUrl,
        true // replaceCart
      );

      console.log(
        "[MenuDetailPage] 재시도 결과:",
        JSON.stringify(retryResult, null, 2)
      );

      if (retryResult.success) {
        console.log("[MenuDetailPage] 재시도 성공");
        setConflictData({ success: true });
        setShowConflictModal(true);
      } else {
        console.log("[MenuDetailPage] 재시도 실패");
        alert("장바구니 추가에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("[MenuDetailPage] handleReplaceCart 에러:", error);
      alert(error.message || "장바구니 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCloseModal = () => {
    setShowConflictModal(false);
    setConflictData(null);
    if (conflictData?.success) {
      navigate(-1); // 성공 시 이전 페이지로
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: menu.foodName,
          text: menu.description,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      alert("공유 기능을 지원하지 않는 브라우저입니다.");
    }
  };

  return (
    <PageContainer>
      {/* 헤더 */}
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} />
        </BackButton>
        <HeaderActions>
          <IconButton onClick={handleShare}>
            <FiShare2 size={24} />
          </IconButton>
          <CartIconButton onClick={() => navigate("/cart")}>
            <FiShoppingCart size={24} />
            {items.length > 0 && <CartBadge>{items.length}</CartBadge>}
          </CartIconButton>
        </HeaderActions>
      </Header>

      {/* 컨텐츠 */}
      <Content>
        {/* 메뉴 이미지 */}
        <MenuImageContainer>
          <MenuImage
            src={menu.imageUrl || "/placeholder-menu.jpg"}
            alt={menu.foodName}
            onError={(e) => {
              e.currentTarget.src = "/placeholder-menu.jpg";
            }}
          />
        </MenuImageContainer>

        {/* 메뉴 정보 */}
        <MenuInfo>
          <MenuName>{menu.foodName}</MenuName>
          <MenuDescription>
            {menu.description ||
              "신선한 펩시 콜라로 상쾌함을 더하세요! 식사와 함께, 혹은 간식과 함께 즐기기 좋습니다. 언제든 시원하게 즐길 수 있는 최고의 선택."}
          </MenuDescription>
        </MenuInfo>

        {/* 가격 정보 */}
        <PriceSection>
          <SectionTitle>가격</SectionTitle>
          <PriceInfoBox>
            <PriceLabel>단가</PriceLabel>
            <PriceValue>{menu.price.toLocaleString()}원</PriceValue>
          </PriceInfoBox>
        </PriceSection>

        {/* 수량 선택 */}
        <QuantitySection>
          <SectionTitle>수량</SectionTitle>
          <QuantityControl>
            <QuantityButton
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <FiMinus size={20} />
            </QuantityButton>
            <QuantityDisplay>{quantity}개</QuantityDisplay>
            <QuantityButton
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 99}
            >
              <FiPlus size={20} />
            </QuantityButton>
          </QuantityControl>
        </QuantitySection>
      </Content>

      {/* 하단 장바구니 바 */}
      <BottomBar>
        <CartSummary>
          <CartLabel>현재 장바구니 총액</CartLabel>
          <CartAmount>
            {cartTotal.toLocaleString()}원 + {totalPrice.toLocaleString()} ={" "}
            {(cartTotal + totalPrice).toLocaleString()}
          </CartAmount>
        </CartSummary>
        <AddToCartButton onClick={handleAddToCart} disabled={isAddingToCart}>
          {isAddingToCart
            ? "추가 중..."
            : `${totalPrice.toLocaleString()}원 담기`}
        </AddToCartButton>
      </BottomBar>

      {/* Conflict/Success Modal */}
      {showConflictModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            {conflictData?.success ? (
              // 성공 모달
              <>
                <ModalIcon>
                  <FiCheckCircle />
                </ModalIcon>
                <ModalTitle>장바구니에 추가되었습니다</ModalTitle>
                <ModalMessage>
                  {menu.foodName} {quantity}개가 장바구니에 담겼습니다.
                </ModalMessage>
                <ModalButtons>
                  <ModalButton onClick={handleCloseModal} $primary>
                    확인
                  </ModalButton>
                </ModalButtons>
              </>
            ) : (
              // Conflict 모달
              <>
                <ModalIcon>
                  <FiAlertTriangle />
                </ModalIcon>
                <ModalTitle>다른 가게의 상품이 있습니다</ModalTitle>
                <ModalMessage>
                  {conflictData?.currentStoreName || "현재 장바구니"}의 상품이
                  장바구니에 있습니다.
                  <br />
                  기존 장바구니를 비우고 새로운 상품을 추가하시겠습니까?
                </ModalMessage>
                <ModalButtons>
                  <ModalButton onClick={handleCloseModal}>취소</ModalButton>
                  <ModalButton onClick={handleReplaceCart} $primary>
                    장바구니 비우고 추가
                  </ModalButton>
                </ModalButtons>
              </>
            )}
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
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

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
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

const CartIconButton = styled(IconButton)`
  position: relative;
`;

const CartBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #ff4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
`;

const MenuImageContainer = styled.div`
  width: 100%;
  height: 400px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const MenuImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const MenuInfo = styled.div`
  padding: 24px 20px;
  border-bottom: 8px solid #f8f9fa;
`;

const MenuName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px 0;
`;

const MenuDescription = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const PriceSection = styled.div`
  padding: 24px 20px;
  border-bottom: 8px solid #f8f9fa;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px 0;
`;

const PriceInfoBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const PriceLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #666;
`;

const PriceValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #ff6b35;
`;

const QuantitySection = styled.div`
  padding: 24px 20px;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
    border-color: #ccc;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const QuantityDisplay = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #000;
  min-width: 40px;
  text-align: center;
`;

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1px solid #e5e5e5;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;

  @media (min-width: 431px) {
    max-width: 430px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const CartSummary = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CartLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const CartAmount = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #000;
`;

const AddToCartButton = styled.button<{ disabled?: boolean }>`
  padding: 14px 24px;
  background-color: ${(props) => (props.disabled ? "#ccc" : "#ff6b35")};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  white-space: nowrap;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#ccc" : "#ff5722")};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "scale(0.98)")};
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
`;

const ErrorButton = styled.button`
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

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px 24px;
  max-width: 340px;
  width: calc(100% - 40px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalIcon = styled.div`
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;

  svg {
    width: 48px;
    height: 48px;
    color: #ff6b35;
  }
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #000;
  text-align: center;
  margin: 0 0 12px 0;
`;

const ModalMessage = styled.p`
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin: 0 0 24px 0;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 14px;
  border: ${(props) => (props.$primary ? "none" : "1px solid #e0e0e0")};
  border-radius: 8px;
  background-color: ${(props) => (props.$primary ? "#ff6b35" : "#ffffff")};
  color: ${(props) => (props.$primary ? "#ffffff" : "#666")};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$primary ? "#ff5722" : "#f5f5f5")};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default MenuDetailPage;
