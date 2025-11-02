import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { useCartStore } from "../../store/cartStore";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }
    // 지출 등록 페이지로 이동
    navigate("/spending/create", { state: { cartItems: items } });
  };

  const handleQuantityChange = (
    foodId: number,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateQuantity(foodId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("장바구니를 비우시겠습니까?")) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <header className="cart-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <h1>장바구니</h1>
          <div className="header-space"></div>
        </header>

        <div className="empty-cart">
          <p>장바구니가 비어있습니다</p>
          <Button variant="primary" onClick={() => navigate("/recommendation")}>
            메뉴 둘러보기
          </Button>
        </div>
      </div>
    );
  }

  // 가게별로 그룹화
  const groupedByStore = items.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        items: [],
      };
    }
    acc[item.storeId].items.push(item);
    return acc;
  }, {} as Record<number, { storeName: string; items: typeof items }>);

  return (
    <div className="cart-page">
      <header className="cart-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>장바구니 ({getTotalItems()})</h1>
        <button className="clear-button" onClick={handleClearCart}>
          전체삭제
        </button>
      </header>

      <div className="cart-content">
        {Object.entries(groupedByStore).map(
          ([storeId, { storeName, items: storeItems }]) => (
            <div key={storeId} className="store-group">
              <h2 className="store-name">{storeName}</h2>

              {storeItems.map((item) => (
                <Card key={item.foodId} className="cart-item">
                  <div className="item-content">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.foodName}
                        className="item-image"
                      />
                    )}
                    <div className="item-info">
                      <h3 className="item-name">{item.foodName}</h3>
                      <p className="item-price">
                        {item.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  <div className="item-controls">
                    <div className="quantity-control">
                      <button
                        className="quantity-button"
                        onClick={() =>
                          handleQuantityChange(item.foodId, item.quantity, -1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-button"
                        onClick={() =>
                          handleQuantityChange(item.foodId, item.quantity, 1)
                        }
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <button
                      className="remove-button"
                      onClick={() => removeItem(item.foodId)}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="item-total">
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>

      <div className="cart-footer">
        <div className="total-section">
          <span className="total-label">총 금액</span>
          <span className="total-amount">
            {getTotalPrice().toLocaleString()}원
          </span>
        </div>
        <Button
          variant="primary"
          size="large"
          onClick={handleCheckout}
          className="checkout-button"
        >
          결제하기
        </Button>
      </div>
    </div>
  );
};

export default CartPage;
