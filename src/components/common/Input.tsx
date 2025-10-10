import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = "text",
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const inputClass = [
    "input-wrapper",
    fullWidth && "input-full-width",
    error && "input-error",
    leftIcon && "input-with-left-icon",
    (rightIcon || isPassword) && "input-with-right-icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={inputClass}>
      {label && <label className="input-label">{label}</label>}

      <div className="input-container">
        {leftIcon && (
          <span className="input-icon input-icon-left">{leftIcon}</span>
        )}

        <input type={inputType} className="input-field" {...props} />

        {isPassword && (
          <button
            type="button"
            className="input-icon input-icon-right password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}

        {!isPassword && rightIcon && (
          <span className="input-icon input-icon-right">{rightIcon}</span>
        )}
      </div>

      {error && <span className="input-error-text">{error}</span>}
      {!error && helperText && (
        <span className="input-helper-text">{helperText}</span>
      )}
    </div>
  );
};
