import React from "react";
import styled, { css, keyframes } from "styled-components";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const StyledButton = styled.button<{
  $variant: string;
  $size: string;
  $fullWidth: boolean;
  $loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: inherit;
  position: relative;

  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  ${(props) => {
    switch (props.$size) {
      case "small":
        return css`
          height: 36px;
          padding: 0 1rem;
          font-size: 0.875rem;
        `;
      case "large":
        return css`
          height: 56px;
          padding: 0 2rem;
          font-size: 1.125rem;
        `;
      default: // medium
        return css`
          height: 48px;
          padding: 0 1.5rem;
          font-size: 1rem;
        `;
    }
  }}

  ${(props) => {
    switch (props.$variant) {
      case "secondary":
        return css`
          background-color: ${props.theme.colors.secondary};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.secondaryDark};
          }
        `;
      case "outline":
        return css`
          background-color: transparent;
          color: ${props.theme.colors.primary};
          border: 2px solid ${props.theme.colors.primary};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primaryLight};
          }
        `;
      case "text":
        return css`
          background-color: transparent;
          color: ${props.theme.colors.primary};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.gray[100]};
          }
        `;
      default: // primary
        return css`
          background-color: ${props.theme.colors.primary};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primaryDark};
          }
        `;
    }
  }}

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.gray[300]};
    color: ${(props) => props.theme.colors.gray[500]};
    cursor: not-allowed;
    border-color: ${(props) => props.theme.colors.gray[300]};
  }

  ${(props) =>
    props.$loading &&
    css`
      pointer-events: none;
      opacity: 0.7;
    `}
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {children}
    </StyledButton>
  );
};
