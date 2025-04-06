import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Broker } from "../types";

interface BrokerFormProps {
  broker?: Broker | null;
  onSubmit: (data: { name: string; balance: number }) => void;
  onCancel: () => void;
}

const BrokerForm: React.FC<BrokerFormProps> = ({
  broker,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});

  useEffect(() => {
    if (broker) {
      setName(broker.name);
      setBalance(broker.balance.toString());
    }
  }, [broker]);

  const validate = (): boolean => {
    const newErrors: { name?: string; balance?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Имя обязательно";
    }

    if (!balance) {
      newErrors.balance = "Баланс обязателен";
    } else if (isNaN(Number(balance)) || Number(balance) < 0) {
      newErrors.balance = "Баланс должен быть положительным числом";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        name: name.trim(),
        balance: Number(balance),
      });
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormTitle>{broker ? "Изменить брокера" : "Создать брокера"}</FormTitle>

      <FormGroup>
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите имя брокера"
        />
        {errors.name && <ErrorText>{errors.name}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="balance">Баланс</Label>
        <Input
          id="balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="Введите баланс"
          min="0"
        />
        {errors.balance && <ErrorText>{errors.balance}</ErrorText>}
      </FormGroup>

      <ButtonGroup>
        <CancelButton type="button" onClick={onCancel}>
          Отмена
        </CancelButton>
        <SubmitButton type="submit">
          {broker ? "Сохранить" : "Создать"}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
};

// Стили
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FormTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  color: #333;

  &:focus {
    border-color: #4a90e2;
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const ErrorText = styled.span`
  color: #e25c5c;
  font-size: 14px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
`;

const CancelButton = styled(Button)`
  background-color: #f0f0f0;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #4a90e2;
  color: white;

  &:hover {
    background-color: #3a7bc8;
  }
`;

export default BrokerForm;
