import React from "react";
import { FiMapPin, FiStar, FiHeart } from "react-icons/fi";
import { Card } from "../common/Card";
import type { Store } from "../../types/api";
import "./StoreCard.css";

interface StoreCardProps {
  store: Store;
  onClick?: () => void;
  onFavoriteClick?: () => void;
  showDistance?: boolean;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onClick,
  onFavoriteClick,
  showDistance = true,
}) => {
  return (
    <Card className="store-card" onClick={onClick} hoverable>
      <div className="store-card-image-container">
        <img
          src={store.imageUrl || "/placeholder-store.png"}
          alt={store.storeName}
          className="store-card-image"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-store.png";
          }}
        />
        {store.popularityTag && (
          <span className="store-card-tag">{store.popularityTag}</span>
        )}
        <button
          className={`store-card-favorite ${store.isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
        >
          <FiHeart />
        </button>
      </div>

      <div className="store-card-content">
        <h3 className="store-card-name">{store.storeName}</h3>
        <p className="store-card-category">{store.category}</p>

        <div className="store-card-meta">
          {showDistance && (
            <span className="store-card-meta-item">
              <FiMapPin />
              {store.distance}m
            </span>
          )}
          <span className="store-card-meta-item">
            <FiStar />
            {store.reviewCount}개 리뷰
          </span>
        </div>

        <div className="store-card-footer">
          <span className="store-card-price">
            평균 {store.averagePrice.toLocaleString()}원
          </span>
          <span
            className={`store-card-status ${store.isOpen ? "open" : "closed"}`}
          >
            {store.isOpen ? "영업중" : "영업종료"}
          </span>
        </div>
      </div>
    </Card>
  );
};
