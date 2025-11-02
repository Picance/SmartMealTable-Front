import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaShoppingCart,
} from "react-icons/fa";
import { storeService } from "../../services/store.service.ts";
import { useCartStore } from "../../store/cartStore";
import type { StoreDetail, Menu } from "../../types/api";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";

const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, getTotalItems } = useCartStore();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"menu" | "info" | "review">(
    "menu"
  );

  useEffect(() => {
    if (id) {
      loadStoreData(parseInt(id));
    }
  }, [id]);

  const loadStoreData = async (storeId: number) => {
    setLoading(true);
    try {
      // 가게 상세 정보 로드
      const storeResponse = await storeService.getStoreDetail(storeId);
      if (storeResponse.result === "SUCCESS" && storeResponse.data) {
        setStore(storeResponse.data);
        setIsFavorite(storeResponse.data.isFavorite || false);
      }

      // 메뉴 목록 로드
      const menusResponse = await storeService.getStoreMenus(storeId);
      if (menusResponse.result === "SUCCESS" && menusResponse.data) {
        setMenus(menusResponse.data);
      }
    } catch (error) {
      console.error("Failed to load store data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!store) return;

    try {
      if (isFavorite) {
        await storeService.removeFavorite(store.storeId);
      } else {
        await storeService.addFavorite(store.storeId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleAddToCart = (menu: Menu) => {
    if (!store) return;

    addItem({
      foodId: menu.foodId,
      foodName: menu.foodName,
      price: menu.price,
      imageUrl: menu.imageUrl,
      storeId: store.storeId,
      storeName: store.storeName,
    });

    alert(`${menu.foodName}이(가) 장바구니에 추가되었습니다.`);
  };

  if (loading) {
    return (
      <div className="store-detail-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="store-detail-page">
        <div className="error">가게 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="store-detail-page">
      {/* 헤더 */}
      <header className="store-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>가게 상세</h1>
        <div className="header-actions">
          <button className="cart-button" onClick={() => navigate("/cart")}>
            <FaShoppingCart />
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </button>
          <button className="favorite-button" onClick={handleFavoriteToggle}>
            {isFavorite ? (
              <FaHeart className="favorite-icon active" />
            ) : (
              <FaRegHeart className="favorite-icon" />
            )}
          </button>
        </div>
      </header>

      {/* 가게 이미지 */}
      <div className="store-image-container">
        <img
          src={store.imageUrl || "/placeholder-store.jpg"}
          alt={store.storeName}
        />
      </div>

      {/* 가게 기본 정보 */}
      <div className="store-info-section">
        <h2 className="store-name">{store.storeName}</h2>
        <div className="store-rating">
          <FaStar className="star-icon" />
          <span className="review-count">리뷰 {store.reviewCount}개</span>
          <span className="average-price">
            평균 {store.averagePrice.toLocaleString()}원
          </span>
        </div>

        <div className="store-details">
          <div className="detail-item">
            <FaMapMarkerAlt className="icon" />
            <span>{store.address}</span>
          </div>
          {store.distance && (
            <div className="detail-item">
              <span className="distance">{store.distance}km</span>
            </div>
          )}
          {store.phone && (
            <div className="detail-item">
              <FaPhone className="icon" />
              <a href={`tel:${store.phone}`}>{store.phone}</a>
            </div>
          )}
          {store.operatingHours && store.operatingHours.length > 0 && (
            <div className="detail-item">
              <FaClock className="icon" />
              <span>
                {store.operatingHours[0].openTime} -{" "}
                {store.operatingHours[0].closeTime}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="tabs">
        <button
          className={`tab ${selectedTab === "menu" ? "active" : ""}`}
          onClick={() => setSelectedTab("menu")}
        >
          메뉴
        </button>
        <button
          className={`tab ${selectedTab === "info" ? "active" : ""}`}
          onClick={() => setSelectedTab("info")}
        >
          정보
        </button>
        <button
          className={`tab ${selectedTab === "review" ? "active" : ""}`}
          onClick={() => setSelectedTab("review")}
        >
          리뷰
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="tab-content">
        {selectedTab === "menu" && (
          <div className="menu-list">
            {menus.length === 0 ? (
              <div className="empty-state">등록된 메뉴가 없습니다.</div>
            ) : (
              menus.map((menu) => (
                <Card key={menu.foodId} className="menu-item">
                  <div className="menu-content">
                    {menu.imageUrl && (
                      <img
                        src={menu.imageUrl}
                        alt={menu.foodName}
                        className="menu-image"
                      />
                    )}
                    <div className="menu-info">
                      <h3 className="menu-name">{menu.foodName}</h3>
                      {menu.description && (
                        <p className="menu-description">{menu.description}</p>
                      )}
                      <p className="menu-price">
                        {menu.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleAddToCart(menu)}
                  >
                    담기
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}

        {selectedTab === "info" && (
          <div className="info-section">
            <Card className="info-card">
              <h3>가게 정보</h3>
              <div className="info-item">
                <span className="label">주소</span>
                <span className="value">{store.address}</span>
              </div>
              {store.phone && (
                <div className="info-item">
                  <span className="label">전화번호</span>
                  <a href={`tel:${store.phone}`} className="value">
                    {store.phone}
                  </a>
                </div>
              )}
              {store.operatingHours && store.operatingHours.length > 0 && (
                <div className="info-item">
                  <span className="label">영업시간</span>
                  <div className="value">
                    {store.operatingHours.map((hours, index) => (
                      <div key={index}>
                        {hours.dayOfWeek}:{" "}
                        {hours.isHoliday
                          ? "휴무"
                          : `${hours.openTime} - ${hours.closeTime}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {store.description && (
                <div className="info-item">
                  <span className="label">소개</span>
                  <p className="value">{store.description}</p>
                </div>
              )}
            </Card>

            {/* 지도 영역 */}
            <Card className="map-card">
              <h3>위치</h3>
              <div className="map-placeholder">
                <p>지도가 여기에 표시됩니다</p>
                <p className="map-note">네이버 지도 API 연동 필요</p>
              </div>
            </Card>
          </div>
        )}

        {selectedTab === "review" && (
          <div className="review-section">
            <Card className="review-summary">
              <h3>리뷰 요약</h3>
              <div className="rating-summary">
                <span className="review-count">
                  {store.reviewCount}개의 리뷰
                </span>
              </div>
            </Card>

            <div className="review-list">
              <div className="empty-state">
                리뷰 기능은 추후 구현 예정입니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailPage;
