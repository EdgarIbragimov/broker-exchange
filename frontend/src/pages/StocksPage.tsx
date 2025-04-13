import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { RootState } from "../types";
import {
  fetchStocks,
  toggleStockTrading,
  setSelectedStock,
} from "../redux/slices/stocksSlice";
import StockList from "../components/StockList";
import StockCharts from "../components/StockCharts";
import { AppDispatch } from "../redux/store";
import { subscribeTradingStatus } from "../api/socketApi";
import { updateStockPrices } from "../redux/slices/stocksSlice";
import { updateTradingStatus } from "../redux/slices/marketSettingsSlice";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 1rem;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  color: #ef4444;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  margin-bottom: 1rem;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const TradingStatusBadge = styled.div<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${(props) => (props.$active ? "#c6f6d5" : "#e2e8f0")};
  color: ${(props) => (props.$active ? "#2f855a" : "#4a5568")};
`;

const StatusIndicator = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: ${(props) => (props.$active ? "#48bb78" : "#a0aec0")};
  margin-right: 0.5rem;
`;

const TradingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-bottom: 0.25rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
`;

const StocksPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stocks, selectedStock, loading, error } = useSelector(
    (state: RootState) => state.stocks
  );
  const { currentDate, isTradingActive } = useSelector(
    (state: RootState) => state.marketSettings
  );

  useEffect(() => {
    dispatch(fetchStocks());

    // Subscribe to trading status updates
    const unsubscribe = subscribeTradingStatus((status) => {
      dispatch(updateStockPrices(status));
      dispatch(updateTradingStatus(status));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    if (loading && stocks.length === 0) {
      dispatch(fetchStocks());
    }
  }, [loading, dispatch]);

  const handleToggleTrading = (symbol: string, useInTrading: boolean) => {
    dispatch(toggleStockTrading({ symbol, useInTrading }));
  };

  const handleViewDetails = (symbol: string) => {
    dispatch(setSelectedStock(symbol));
  };

  const handleBackToList = () => {
    dispatch(setSelectedStock(null));
  };

  const selectedStockData = selectedStock
    ? stocks.find((stock) => stock.symbol === selectedStock)
    : null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && stocks.length === 0) {
    return <LoadingSpinner>Загрузка данных...</LoadingSpinner>;
  }

  return (
    <PageContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {selectedStockData ? (
        <>
          <BackButton onClick={handleBackToList}>
            ← Вернуться к списку акций
          </BackButton>
          <StockCharts stock={selectedStockData} />
        </>
      ) : (
        <>
          <PageHeader>
            <PageTitle>Доступные акции</PageTitle>

            <TradingStatusBadge $active={isTradingActive}>
              <StatusIndicator $active={isTradingActive} />
              {isTradingActive ? "Торги активны" : "Торги остановлены"}
            </TradingStatusBadge>
          </PageHeader>

          {isTradingActive && currentDate && (
            <TradingInfo>
              <InfoRow>
                <InfoLabel>Текущая дата торгов:</InfoLabel>
                <span>{formatDate(currentDate)}</span>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Активных акций в торгах:</InfoLabel>
                <span>
                  {stocks.filter((s) => s.useInTrading).length} из{" "}
                  {stocks.length}
                </span>
              </InfoRow>
            </TradingInfo>
          )}

          <StockList
            stocks={stocks}
            onToggleTrading={handleToggleTrading}
            onViewDetails={handleViewDetails}
          />
        </>
      )}
    </PageContainer>
  );
};

export default StocksPage;
