import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FiArrowLeft, FiShare2, FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { useCartStore } from "../../store/cartStore";
import type { Menu } from "../../types/api";

interface MenuOption {
  id: string;
  name: string;
  price: number;
  isRequired?: boolean;
}

const MenuDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, addItem, getTotalPrice } = useCartStore();
  
  // location.state에서 메뉴 정보 가져오기
  const menu = location.state?.menu as Menu;
  const storeName = location.state?.storeName as string;
  const storeId = location.state?.storeId as number;

  // 메뉴 옵션 (실제로는 API에서 가져와야 함)
  const [options] = useState<MenuOption[]>([
    { id: "500ml", name: "500ML", price: 1800, isRequired: true },
    { id: "1.25l", name: "1.25L", price: 2800 },
  ]);

  const [selectedOption, setSelectedOption] = useState<string>("500ml");
  const [quantity, setQuantity] = useState(1);

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

  const selectedOptionData = options.find(opt => opt.id === selectedOption);
  const totalPrice = (selectedOptionData?.price || menu.price) * quantity;
  const cartTotal = getTotalPrice();

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!storeId || !storeName) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        foodId: menu.foodId,
        foodName: `${menu.foodName} (${selectedOptionData?.name || "기본"})`,
        price: selectedOptionData?.price || menu.price,
        imageUrl: menu.imageUrl,
        storeId: storeId,
        storeName: storeName,
      });
    }

    navigate(-1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: menu.foodName,
        text: menu.description,
        url: window.location.href,
      }).catch(console.error);
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
            {menu.description || "신선한 펩시 콜라로 상쾌함을 더하세요! 식사와 함께, 혹은 간식과 함께 즐기기 좋습니다. 언제든 시원하게 즐길 수 있는 최고의 선택."}
          </MenuDescription>
        </MenuInfo>

        {/* 가격 옵션 */}
        <PriceSection>
          <SectionTitle>가격</SectionTitle>
          <OptionsContainer>
            {options.map((option) => (
              <OptionRow key={option.id}>
                <RadioButton
                  type="radio"
                  id={option.id}
                  name="menuOption"
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                />
                <RadioLabel htmlFor={option.id}>
                  <OptionName>
                    {option.name}
                    {option.isRequired && <RequiredBadge>필수</RequiredBadge>}
                  </OptionName>
                  <OptionPrice>{option.price.toLocaleString()}원</OptionPrice>
                </RadioLabel>
              </OptionRow>
            ))}
          </OptionsContainer>
        </PriceSection>

        {/* 수량 선택 */}
        <QuantitySection>
          <SectionTitle>수량</SectionTitle>
          <QuantityControl>
            <QuantityButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
              <FiMinus size={20} />
            </QuantityButton>
            <QuantityDisplay>{quantity}개</QuantityDisplay>
            <QuantityButton onClick={() => handleQuantityChange(1)} disabled={quantity >= 99}>
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
            {cartTotal.toLocaleString()}원 + {totalPrice.toLocaleString()} = {(cartTotal + totalPrice).toLocaleString()}
          </CartAmount>
        </CartSummary>
        <AddToCartButton onClick={handleAddToCart}>
          {totalPrice.toLocaleString()}원 담기
        </AddToCartButton>
      </BottomBar>
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

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RadioButton = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #ff6b35;
`;

const RadioLabel = styled.label`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const OptionName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RequiredBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background-color: #ff4444;
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
`;

const OptionPrice = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #000;
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

const AddToCartButton = styled.button`
  padding: 14px 24px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
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

export default MenuDetailPage;
