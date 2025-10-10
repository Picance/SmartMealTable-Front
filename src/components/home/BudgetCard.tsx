import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { Card } from "../common/Card";
import "./BudgetCard.css";

interface BudgetCardProps {
  title: string;
  budget: number;
  spent: number;
  remaining: number;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  title,
  budget,
  spent,
  remaining,
  icon,
  variant = "primary",
}) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = spent > budget;

  return (
    <Card className={`budget-card budget-card-${variant}`}>
      <div className="budget-card-header">
        <div className="budget-card-title">
          {icon && <span className="budget-card-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        {isOverBudget && (
          <span className="budget-card-warning">
            <FiTrendingUp />
          </span>
        )}
      </div>

      <div className="budget-card-amount">
        <span className="budget-card-spent">{spent.toLocaleString()}원</span>
        <span className="budget-card-budget">
          / {budget.toLocaleString()}원
        </span>
      </div>

      <div className="budget-card-progress-container">
        <div className="budget-card-progress-bar">
          <div
            className={`budget-card-progress-fill ${
              isOverBudget ? "over-budget" : ""
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="budget-card-percentage">{percentage.toFixed(0)}%</span>
      </div>

      <div className="budget-card-remaining">
        <span className="budget-card-remaining-label">남은 예산</span>
        <span
          className={`budget-card-remaining-amount ${
            remaining < 0 ? "negative" : ""
          }`}
        >
          {remaining >= 0 ? (
            <>
              <FiTrendingDown />
              {remaining.toLocaleString()}원
            </>
          ) : (
            <>
              <FiTrendingUp />
              {Math.abs(remaining).toLocaleString()}원 초과
            </>
          )}
        </span>
      </div>
    </Card>
  );
};
