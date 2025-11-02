import React from "react";
import styled from "styled-components";
import { Card } from "../common/Card";

interface MenuCardProps {
  menuName: string;
  price: number;
  imageUrl?: string;
  storeName: string;
  distance?: number;
  recommendationReason?: string;
  onClick?: () => void;
}

const StyledCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
`;

const MenuImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Badge = styled.span`
  position: absolute;
  bottom: ${props => props.theme.spacing.md};
  left: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const MenuName = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const StoreName = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.tertiary};
  margin: 0;
`;

const Distance = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.gray[500]};
  margin: 0;
`;

const Price = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-top: ${props => props.theme.spacing.xs};
`;

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
    <StyledCard onClick={onClick} hoverable>
      <ImageContainer>
        <MenuImage
          src={imageUrl || "/placeholder-food.png"}
          alt={menuName}
          onError={(e) => {
            e.currentTarget.src = "/placeholder-food.png";
          }}
        />
        {recommendationReason && <Badge>{recommendationReason}</Badge>}
      </ImageContainer>

      <Content>
        <MenuName>{menuName}</MenuName>
        <StoreName>{storeName}</StoreName>
        {distance !== undefined && <Distance>{distance}m</Distance>}
        <Price>{price.toLocaleString()}원</Price>
      </Content>
    </StyledCard>
  );
};
