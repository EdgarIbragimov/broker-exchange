import { IBroker } from '../models/broker.interface';
import { v4 as uuidv4 } from 'uuid';

export class Broker implements IBroker {
  id: string;
  name: string;
  balance: number;
  stocks: {
    symbol: string;
    quantity: number;
    averagePrice: number;
  }[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IBroker>) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.balance = data.balance || 0;
    this.stocks = data.stocks || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Метод для покупки акций
  buyStock(symbol: string, quantity: number, price: number): boolean {
    const totalCost = quantity * price;
    if (this.balance < totalCost) {
      return false;
    }

    const existingStock = this.stocks.find((s) => s.symbol === symbol);
    if (existingStock) {
      const totalQuantity = existingStock.quantity + quantity;
      const totalValue =
        existingStock.quantity * existingStock.averagePrice + quantity * price;
      existingStock.averagePrice = totalValue / totalQuantity;
      existingStock.quantity = totalQuantity;
    } else {
      this.stocks.push({
        symbol,
        quantity,
        averagePrice: price,
      });
    }

    this.balance -= totalCost;
    this.updatedAt = new Date();
    return true;
  }

  // Метод для продажи акций
  sellStock(symbol: string, quantity: number, price: number): boolean {
    const stockIndex = this.stocks.findIndex((s) => s.symbol === symbol);
    if (stockIndex === -1 || this.stocks[stockIndex].quantity < quantity) {
      return false;
    }

    const totalValue = quantity * price;
    this.stocks[stockIndex].quantity -= quantity;

    if (this.stocks[stockIndex].quantity === 0) {
      this.stocks.splice(stockIndex, 1);
    }

    this.balance += totalValue;
    this.updatedAt = new Date();
    return true;
  }

  // Метод для обновления баланса
  updateBalance(amount: number): void {
    this.balance = amount;
    this.updatedAt = new Date();
  }
}
