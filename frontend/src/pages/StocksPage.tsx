import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { RootState } from "../types";
import { fetchStocks, toggleStockTrading, setSelectedStock } from "../redux/slices/stocksSlice";
import StockList from "../components/StockList";
import StockCharts from "../components/StockCharts";
import { AppDispatch } from "../redux/store";

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
  
  &:hover {
    text-decoration: underline;
  }
`;

const StocksPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stocks, selectedStock, loading, error } = useSelector(
    (state: RootState) => state.stocks
  );
  
  useEffect(() => {
    dispatch(fetchStocks());
  }, [dispatch]);
  
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
    ? stocks.find(stock => stock.symbol === selectedStock) 
    : null;
  
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
          </PageHeader>
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