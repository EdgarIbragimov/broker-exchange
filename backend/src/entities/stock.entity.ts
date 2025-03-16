import {
  IStock,
  IStockPrice,
  SupportedStockSymbol,
} from '../models/stock.interface';

export class Stock implements IStock {
  symbol: SupportedStockSymbol;
  companyName: string;
  isActive: boolean;
  historicalData: IStockPrice[];
  currentPrice: string;

  constructor(data: Partial<IStock>) {
    this.symbol = data.symbol as SupportedStockSymbol;
    this.companyName = data.companyName || '';
    this.isActive = data.isActive || false;
    this.historicalData = data.historicalData || [];
    this.currentPrice = data.currentPrice || '0';
  }

  // Метод для обновления текущей цены
  updateCurrentPrice(price: string): void {
    this.currentPrice = price;
  }

  // Метод для добавления исторических данных
  addHistoricalData(data: IStockPrice): void {
    this.historicalData.push(data);
  }

  // Метод для получения цены в числовом формате
  getCurrentPriceAsNumber(): number {
    return parseFloat(this.currentPrice.replace('$', ''));
  }
}
