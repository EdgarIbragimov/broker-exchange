import api from "./axios";
import { Stock } from "../types";

//API для акций

const stocksApi = {
  // Получение всех акций
  getAllStocks: async (): Promise<Stock[]> => {
    const response = await api.get("/stocks");
    return response.data.map((stock: any) => ({
      symbol: stock.symbol,
      company: stock.companyName,
      currentPrice: parseFloat(stock.currentPrice.replace("$", "")),
      useInTrading: stock.isActive,
      history: stock.historicalData.map((item: any) => ({
        date: item.date,
        price: parseFloat(item.open.replace("$", "")),
      })),
    }));
  },

  // Получение акции по символу
  getStockBySymbol: async (symbol: string): Promise<Stock> => {
    const response = await api.get(`/stocks/${symbol}`);
    return {
      symbol: response.data.symbol,
      company: response.data.companyName,
      currentPrice: parseFloat(response.data.currentPrice.replace("$", "")),
      useInTrading: response.data.isActive,
      history: response.data.historicalData.map((item: any) => ({
        date: item.date,
        price: parseFloat(item.open.replace("$", "")),
      })),
    };
  },

  // Обновление статуса акции (участвует в торгах или нет)
  updateStockTradingStatus: async (
    symbol: string,
    useInTrading: boolean
  ): Promise<Stock> => {
    // Используем специальный эндпоинт для обновления только статуса торгов
    const response = await api.patch(`/stocks/${symbol}/trading-status`, {
      isActive: useInTrading,
    });

    return {
      symbol: response.data.symbol,
      company: response.data.companyName,
      currentPrice: parseFloat(response.data.currentPrice.replace("$", "")),
      useInTrading: response.data.isActive,
      history: response.data.historicalData.map((item: any) => ({
        date: item.date,
        price: parseFloat(item.open.replace("$", "")),
      })),
    };
  },
};

export default stocksApi;
