import React, { useState } from "react";
import styled, { css } from "styled-components";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const InputWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}
`;

const Label = styled.label`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.text.primary};
`;

const InputContainer = styled.div<{
  $hasLeftIcon: boolean;
  $hasRightIcon: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;

  ${(props) =>
    props.$hasLeftIcon &&
    css`
      padding-left: 2.75rem;
    `}

  ${(props) =>
    props.$hasRightIcon &&
    css`
      padding-right: 2.75rem;
    `}
`;

const StyledInputField = styled.input<{ $hasError: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1px solid
    ${(props) => (props.$hasError ? "#ff4444" : props.theme.colors.gray[300])};
  border-radius: ${(props) => props.theme.borderRadius.base};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.text.primary};
  background-color: ${(props) => props.theme.colors.background.primary};
  transition: border-color 0.2s ease;
  font-family: inherit;

  &::placeholder {
    color: ${(props) => props.theme.colors.gray[500]};
  }

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.$hasError ? "#ff4444" : props.theme.colors.primary};
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.span<{ $position: "left" | "right" }>`
  position: absolute;
  ${(props) => (props.$position === "left" ? "left: 1rem" : "right: 1rem")};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.gray[600]};
  pointer-events: none;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.gray[600]};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    color: ${(props) => props.theme.colors.text.primary};
  }
`;

const ErrorText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: #ff4444;
`;

const HelperText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.text.tertiary};
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = "text",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <InputWrapper $fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}

      <InputContainer
        $hasLeftIcon={!!leftIcon}
        $hasRightIcon={!!(rightIcon || isPassword)}
      >
        {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}

        <StyledInputField type={inputType} $hasError={!!error} {...props} />

        {isPassword && (
          <ToggleButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </ToggleButton>
        )}

        {!isPassword && rightIcon && (
          <IconWrapper $position="right">{rightIcon}</IconWrapper>
        )}
      </InputContainer>

      {error && <ErrorText>{error}</ErrorText>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
};
