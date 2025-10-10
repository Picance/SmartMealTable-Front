import React from "react";
import { Card } from "../common/Card";
import "./MenuCard.css";

interface MenuCardProps {
  menuName: string;
  price: number;
  imageUrl?: string;
  storeName: string;
  distance?: number;
  recommendationReason?: string;
  onClick?: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menuName,
  price,
  imageUrl,
  storeName,
  distance,
  recommendationReason,
  onClick,
}) => {
  return (
    <Card className="menu-card" onClick={onClick} hoverable>
      <div className="menu-card-image-container">
        <img
          src={imageUrl || "/placeholder-food.png"}
          alt={menuName}
          className="menu-card-image"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-food.png";
          }}
        />
        {recommendationReason && (
          <span className="menu-card-badge">{recommendationReason}</span>
        )}
      </div>

      <div className="menu-card-content">
        <h4 className="menu-card-name">{menuName}</h4>
        <p className="menu-card-store">{storeName}</p>
        {distance !== undefined && (
          <p className="menu-card-distance">{distance}m</p>
        )}
        <div className="menu-card-price">{price.toLocaleString()}원</div>
      </div>
    </Card>
  );
};
