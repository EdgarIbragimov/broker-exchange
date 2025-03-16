export interface IStockPrice {
  date: string;
  open: string;
}

export interface IStock {
  symbol: string; // Тикер акции
  companyName: string; // Название компании
  isActive: boolean; // Участвует ли в торгах
  historicalData: IStockPrice[]; // Исторические данные
  currentPrice: string; // Текущая цена
}

export type SupportedStockSymbol =
  | 'AAPL' // Apple, Inc.
  | 'SBUX' // Starbucks, Inc.
  | 'MSFT' // Microsoft, Inc.
  | 'CSCO' // Cisco Systems, Inc.
  | 'QCOM' // QUALCOMM Incorporated
  | 'AMZN' // Amazon.com, Inc.
  | 'TSLA' // Tesla, Inc.
  | 'AMD'; // Advanced Micro Devices, Inc.
