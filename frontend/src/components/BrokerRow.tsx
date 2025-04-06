import React from "react";
import styled from "styled-components";
import { Broker } from "../types";

interface BrokerRowProps {
  broker: Broker;
  onEdit: (broker: Broker) => void;
  onDelete: (id: string) => void;
}

// Reusing styled components or creating similar ones for consistency
const StyledRow = styled.tr`
  &:hover {
    background-color: #f0f7ff; // Same hover effect as StockRow
  }
`;

const Cell = styled.td`
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #eaedf3; // Same border as StockRow
`;

// New styled component for the name cell with truncation
const NameCell = styled(Cell)`
  max-width: 300px; // Adjust max-width as needed
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionCell = styled(Cell)`
  text-align: right;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

// Reusing button styling from BrokerItem
const Button = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.2s;
`;

const EditButton = styled(Button)`
  background-color: #4a90e2;
  color: white;

  &:hover {
    background-color: #3a7bc8;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #e25c5c;
  color: white;

  &:hover {
    background-color: #d14848;
  }
`;

const BrokerRow: React.FC<BrokerRowProps> = ({ broker, onEdit, onDelete }) => {
  return (
    <StyledRow>
      <NameCell title={broker.name}>{broker.name}</NameCell>
      <Cell>${broker.balance.toFixed(2)}</Cell>
      <ActionCell>
        <ButtonGroup>
          <EditButton onClick={() => onEdit(broker)}>Изменить</EditButton>
          <DeleteButton onClick={() => onDelete(broker.id)}>
            Удалить
          </DeleteButton>
        </ButtonGroup>
      </ActionCell>
    </StyledRow>
  );
};

export default BrokerRow;
