import React from "react";
import styled from "styled-components";
import { Stock } from "../types";
import StockRow from "./StockRow";

interface StockListProps {
  stocks: Stock[];
  onToggleTrading: (symbol: string, useInTrading: boolean) => void;
  onViewDetails: (symbol: string) => void;
}

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  min-width: 600px; // Ensure minimum width for mobile
  border-collapse: collapse;
  background-color: white;
`;

const TableHead = styled.thead`
  background-color: #f5f8fa;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

const TableBody = styled.tbody``;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
`;

const StockList: React.FC<StockListProps> = ({
  stocks,
  onToggleTrading,
  onViewDetails,
}) => {
  if (stocks.length === 0) {
    return <EmptyMessage>Акции не найдены</EmptyMessage>;
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <tr>
            <TableHeader>Символ</TableHeader>
            <TableHeader>Компания</TableHeader>
            <TableHeader>Текущая цена</TableHeader>
            <TableHeader>Торги</TableHeader>
            <TableHeader>Действия</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => (
            <StockRow
              key={stock.symbol}
              stock={stock}
              onToggleTrading={onToggleTrading}
              onViewDetails={onViewDetails}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockList;
