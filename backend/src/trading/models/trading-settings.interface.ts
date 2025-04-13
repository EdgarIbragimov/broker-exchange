export interface ITradingSettings {
  startDate: string; // Дата начала торгов
  speedFactor: number; // Скорость смены дат в секундах
  isActive: boolean; // Активны ли торги
  currentDate?: string; // Текущая имитируемая дата торгов
}

export interface ITradingStatus {
  isActive: boolean; // Активны ли торги
  currentDate: string; // Текущая имитируемая дата
  stockPrices: {
    // Текущие цены акций
    symbol: string;
    price: string;
  }[];
}
