import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { RootState } from "../types";
import { AppDispatch } from "../redux/store";
import {
  fetchTradingSettings,
  updateTradingSettings,
  startTrading,
  stopTrading,
  resetErrors,
  updateTradingStatus,
  resetSimulation,
} from "../redux/slices/marketSettingsSlice";
import { initializeSocket, subscribeTradingStatus } from "../api/socketApi";
import {
  updateStockPrices,
  fetchStocks,
  resetStockData,
} from "../redux/slices/stocksSlice";

// Styled components
const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    border-color: #4a90e2;
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 1rem;

  background-color: ${(props) =>
    props.$primary ? "#4a90e2" : props.$danger ? "#e53e3e" : "#e2e8f0"};
  color: ${(props) => (props.$primary || props.$danger ? "#fff" : "#4a5568")};

  &:hover {
    background-color: ${(props) =>
      props.$primary ? "#3a7bc8" : props.$danger ? "#c53030" : "#cbd5e0"};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  margin-top: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;

    ${Button} {
      margin-right: 0;
      width: 100%;
    }
  }
`;

const StatusCard = styled.div`
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const StatusTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 1rem;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const StatusLabel = styled.span`
  font-weight: 500;
  color: #4a5568;
`;

const StatusValue = styled.span`
  color: #2d3748;
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  color: #ef4444;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const MarketSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    tradingStartDate,
    dateChangeRate,
    currentDate,
    isTradingActive,
    loading,
    error,
  } = useSelector((state: RootState) => state.marketSettings);

  // Local state for form inputs
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [speedFactor, setSpeedFactor] = useState<string>("1");

  // Helper for date conversion
  const formatISOtoDateInput = (isoString: string): string => {
    try {
      return isoString ? new Date(isoString).toISOString().slice(0, 10) : "";
    } catch (error) {
      console.error("Invalid date format:", isoString);
      return new Date().toISOString().slice(0, 10);
    }
  };

  // Reset errors when component mounts
  useEffect(() => {
    dispatch(resetErrors());
  }, [dispatch]);

  // Initialize socket and fetch settings
  useEffect(() => {
    const unsubscribe = subscribeTradingStatus((status) => {
      dispatch(updateStockPrices(status));
      dispatch(updateTradingStatus(status));
    });

    dispatch(fetchTradingSettings());

    return unsubscribe;
  }, [dispatch]);

  // Update local form values when settings are loaded
  useEffect(() => {
    if (tradingStartDate) {
      setStartDate(formatISOtoDateInput(tradingStartDate));
    }

    if (dateChangeRate !== undefined && !isNaN(dateChangeRate)) {
      setSpeedFactor(String(dateChangeRate));
    }
  }, [tradingStartDate, dateChangeRate]);

  const handleSaveSettings = () => {
    dispatch(resetErrors());

    const speedFactorNumber = parseInt(speedFactor, 10);
    if (isNaN(speedFactorNumber) || speedFactorNumber < 1) {
      alert("Please enter a valid number for the interval (minimum 1)");
      return;
    }

    try {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new Error("Invalid date");
      }

      dispatch(
        updateTradingSettings({
          startDate: parsedStartDate,
          speedFactor: speedFactorNumber,
        })
      );
    } catch (error) {
      alert("Please enter a valid date");
    }
  };

  const handleStartTrading = () => {
    dispatch(resetErrors());
    dispatch(startTrading());
  };

  const handleStopTrading = () => {
    dispatch(resetErrors());
    dispatch(stopTrading());
  };

  const handleResetSimulation = () => {
    dispatch(resetErrors());

    // First reset stock data in the store
    dispatch(resetStockData());

    // Reset simulation on the server
    dispatch(resetSimulation())
      .unwrap()
      .then(() => dispatch(fetchStocks()).unwrap())
      .then(() => dispatch(fetchTradingSettings()).unwrap())
      .catch((error) => {
        console.error("Error resetting simulation:", error);
      });
  };

  // Format date for display in UI
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";

    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date format";
    }
  };

  return (
    <PageContainer>
      <Card>
        <Title>Настройка рынка</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <Label htmlFor="startDate">Стартовая дата торгов</Label>
          <Input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isTradingActive || loading}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="speedFactor">Интервал изменения цены (сек)</Label>
          <Input
            type="number"
            id="speedFactor"
            min="1"
            max="60"
            value={speedFactor}
            onChange={(e) => setSpeedFactor(e.target.value)}
            disabled={isTradingActive || loading}
          />
        </FormGroup>

        <ButtonGroup>
          <Button
            $primary
            onClick={handleSaveSettings}
            disabled={isTradingActive || loading}
          >
            Сохранить настройки
          </Button>

          {isTradingActive ? (
            <Button $danger onClick={handleStopTrading} disabled={loading}>
              Остановить торги
            </Button>
          ) : (
            <Button $primary onClick={handleStartTrading} disabled={loading}>
              Начать торги
            </Button>
          )}

          <Button
            onClick={handleResetSimulation}
            disabled={loading || isTradingActive}
          >
            Сбросить данные симуляции
          </Button>
        </ButtonGroup>
      </Card>

      <StatusCard>
        <StatusTitle>Текущее состояние рынка</StatusTitle>

        <StatusRow>
          <StatusLabel>Статус торгов:</StatusLabel>
          <StatusValue>
            {isTradingActive ? "Активны" : "Остановлены"}
          </StatusValue>
        </StatusRow>

        <StatusRow>
          <StatusLabel>Стартовая дата:</StatusLabel>
          <StatusValue>{formatDate(tradingStartDate)}</StatusValue>
        </StatusRow>

        <StatusRow>
          <StatusLabel>Текущая дата:</StatusLabel>
          <StatusValue>
            {currentDate ? formatDate(currentDate) : "Не определена"}
          </StatusValue>
        </StatusRow>

        <StatusRow>
          <StatusLabel>Скорость смены дат:</StatusLabel>
          <StatusValue>{dateChangeRate} сек.</StatusValue>
        </StatusRow>
      </StatusCard>
    </PageContainer>
  );
};

export default MarketSettingsPage;
