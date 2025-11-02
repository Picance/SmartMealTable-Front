import React from "react";
import styled, { css } from "styled-components";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { Card } from "../common/Card";

interface BudgetCardProps {
  title: string;
  budget: number;
  spent: number;
  remaining: number;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
}

const StyledCard = styled(Card)<{ $variant: string }>`
  ${(props) => props.$variant === "secondary" && css`
    background: linear-gradient(135deg, ${props.theme.colors.secondary} 0%, ${props.theme.colors.secondaryDark} 100%);
    color: white;
  `}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const WarningIcon = styled.span`
  color: #ff4444;
  display: flex;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.xl};
`;

const Amount = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Spent = styled.span`
  font-size: ${props => props.theme.typography.fontSize["3xl"]};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const Budget = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg};
  opacity: 0.7;
  margin-left: ${props => props.theme.spacing.xs};
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background-color: ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $isOverBudget: boolean }>`
  height: 100%;
  background-color: ${props => props.$isOverBudget ? "#ff4444" : props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  transition: width 0.3s ease;
`;

const Percentage = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  min-width: 40px;
  text-align: right;
`;

const Remaining = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemainingLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  opacity: 0.8;
`;

const RemainingAmount = styled.span<{ $negative: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$negative ? "#ff4444" : "#4caf50"};
`;

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
    <StyledCard $variant={variant}>
      <Header>
        <Title>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          <span>{title}</span>
        </Title>
        {isOverBudget && (
          <WarningIcon>
            <FiTrendingUp />
          </WarningIcon>
        )}
      </Header>

      <Amount>
        <Spent>{spent.toLocaleString()}원</Spent>
        <Budget>/ {budget.toLocaleString()}원</Budget>
      </Amount>

      <ProgressContainer>
        <ProgressBar>
          <ProgressFill
            $isOverBudget={isOverBudget}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </ProgressBar>
        <Percentage>{percentage.toFixed(0)}%</Percentage>
      </ProgressContainer>

      <Remaining>
        <RemainingLabel>남은 예산</RemainingLabel>
        <RemainingAmount $negative={remaining < 0}>
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
        </RemainingAmount>
      </Remaining>
    </StyledCard>
  );
};
