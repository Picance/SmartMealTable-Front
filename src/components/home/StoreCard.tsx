import React from "react";
import styled, { css } from "styled-components";
import { FiMapPin, FiStar, FiHeart } from "react-icons/fi";
import { Card } from "../common/Card";
import type { Store } from "../../types/api";

interface StoreCardProps {
  store: Store;
  onClick?: () => void;
  onFavoriteClick?: () => void;
  showDistance?: boolean;
}

const StyledCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
`;

const StoreImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Tag = styled.span`
  position: absolute;
  top: ${(props) => props.theme.spacing.md};
  left: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.accent};
  color: white;
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: ${(props) => props.theme.spacing.md};
  right: ${(props) => props.theme.spacing.md};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    color: ${(props) =>
      props.$active ? props.theme.colors.accent : props.theme.colors.gray[600]};
    ${(props) =>
      props.$active &&
      css`
        fill: ${props.theme.colors.accent};
      `}
  }

  &:hover {
    background-color: white;
    transform: scale(1.1);
  }
`;

const Content = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`;

const StoreName = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.text.primary};
  margin: 0;
`;

const Category = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.text.tertiary};
  margin: 0;
`;

const Meta = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.xs};
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.text.tertiary};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${(props) => props.theme.spacing.sm};
`;

const Price = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.text.primary};
`;

const Status = styled.span<{ $isOpen: boolean }>`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) =>
    props.$isOpen ? "#4caf50" : props.theme.colors.gray[500]};
`;

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onClick,
  onFavoriteClick,
  showDistance = true,
}) => {
  return (
    <StyledCard onClick={onClick} hoverable>
      <ImageContainer>
        <StoreImage
          src={store.imageUrl || "/placeholder-store.png"}
          alt={store.storeName}
          onError={(e) => {
            e.currentTarget.src = "/placeholder-store.png";
          }}
        />
        {store.popularityTag && <Tag>{store.popularityTag}</Tag>}
        <FavoriteButton
          $active={!!store.isFavorite}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
        >
          <FiHeart />
        </FavoriteButton>
      </ImageContainer>

      <Content>
        <StoreName>{store.storeName}</StoreName>
        <Category>{store.category}</Category>

        <Meta>
          {showDistance && (
            <MetaItem>
              <FiMapPin />
              {store.distance}m
            </MetaItem>
          )}
          <MetaItem>
            <FiStar />
            {store.reviewCount}개 리뷰
          </MetaItem>
        </Meta>

        <Footer>
          <Price>평균 {store.averagePrice.toLocaleString()}원</Price>
          <Status $isOpen={!!store.isOpen}>
            {store.isOpen ? "영업중" : "영업종료"}
          </Status>
        </Footer>
      </Content>
    </StyledCard>
  );
};
