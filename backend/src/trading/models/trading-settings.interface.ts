export interface ITradingSettings {
  startDate: Date; // Дата начала торгов
  speedFactor: number; // Скорость смены дат в секундах
  isActive: boolean; // Активны ли торги
  currentDate?: Date; // Текущая имитируемая дата торгов
}

export interface ITradingStatus {
  isActive: boolean; // Активны ли торги
  currentDate: Date; // Текущая имитируемая дата
  stockPrices: {
    // Текущие цены акций
    symbol: string;
    price: string;
  }[];
}
