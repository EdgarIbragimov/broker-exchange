import React from "react";
import styled from "styled-components";
import { Stock } from "../types";

interface StockRowProps {
  stock: Stock;
  onToggleTrading: (symbol: string, useInTrading: boolean) => void;
  onViewDetails: (symbol: string) => void;
}

const StyledRow = styled.tr`
  &:hover {
    background-color: #f0f7ff;
  }
`;

const Cell = styled.td`
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #eaedf3;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-weight: 500;
  padding: 0.5rem;
  margin-right: 0.5rem;
  transition: color 0.2s;
  font-size: 1rem;

  &:hover {
    color: #3a7bc8;
  }
`;

const ToggleSwitch = styled.label`
  display: inline-block;
  position: relative;
  width: 50px;
  height: 24px;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #4a90e2;
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const Slider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  transition: 0.4s;

  &:before {
    content: "";
    position: absolute;
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }
`;

const StockRow: React.FC<StockRowProps> = ({
  stock,
  onToggleTrading,
  onViewDetails,
}) => {
  // Use a callback that prevents event bubbling
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleTrading(stock.symbol, e.target.checked);
  };

  return (
    <StyledRow>
      <Cell>{stock.symbol}</Cell>
      <Cell>{stock.company}</Cell>
      <Cell>${stock.currentPrice.toFixed(2)}</Cell>
      <Cell>
        <ToggleSwitch onClick={(e) => e.stopPropagation()}>
          <SwitchInput
            type="checkbox"
            checked={stock.useInTrading}
            onChange={handleToggle}
          />
          <Slider />
        </ToggleSwitch>
      </Cell>
      <Cell>
        <ActionButton onClick={() => onViewDetails(stock.symbol)}>
          История котировок
        </ActionButton>
      </Cell>
    </StyledRow>
  );
};

export default StockRow;