export interface IBroker {
  id: string; // Уникальный идентификатор брокера
  name: string; // Имя брокера
  balance: number; // Денежные средства
  stocks: {
    symbol: string; // Тикер акции
    quantity: number; // Количество акций
    averagePrice: number; // Средняя цена покупки
  }[];
  createdAt: Date; // Дата создания
  updatedAt: Date; // Дата последнего обновления
}
