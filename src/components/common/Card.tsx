import React from "react";
import styled, { css } from "styled-components";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const StyledCard = styled.div<{ $hoverable: boolean; $clickable: boolean }>`
  background-color: ${(props) => props.theme.colors.background.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.base};
  transition: all 0.2s ease;

  ${(props) =>
    props.$clickable &&
    css`
      cursor: pointer;
    `}

  ${(props) =>
    props.$hoverable &&
    css`
      &:hover {
        box-shadow: ${props.theme.shadows.md};
        transform: translateY(-2px);
      }
    `}

  ${(props) =>
    props.$clickable &&
    css`
      &:active {
        transform: scale(0.98);
      }
    `}
`;

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false,
}) => {
  return (
    <StyledCard
      className={className}
      onClick={onClick}
      $hoverable={hoverable}
      $clickable={!!onClick}
    >
      {children}
    </StyledCard>
  );
};
