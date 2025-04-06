//Типы для брокера
export interface Broker {
  id: string;
  name: string;
  balance: number;
  stocks?: {
    symbol: string;
    quantity: number;
    averagePrice: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

//Тип для состояния брокеров в редьюсере
export interface BrokersState {
  brokers: Broker[];
  currentBroker: Broker | null;
  loading: boolean;
  error: string | null;
}

//Тип для создания брокера
export interface CreateBrokerDto {
  name: string;
  balance: number;
}

//Тип для обновления брокера
export interface UpdateBrokerDto {
  name?: string;
  balance?: number;
}

export interface StockHistory {
  date: string;
  price: number;
}

export interface Stock {
  symbol: string;
  company: string;
  currentPrice: number;
  useInTrading: boolean;
  history: StockHistory[];
}

export interface StocksState {
  stocks: Stock[];
  selectedStock: string | null;
  loading: boolean;
  error: string | null;
}

export interface MarketSettingsState {
  tradingStartDate: string;
  dateChangeRate: number;
  currentDate: string;
  isTradingActive: boolean;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  brokers: BrokersState;
  stocks: StocksState;
  marketSettings: MarketSettingsState;
}

// Component Props Types

export interface ButtonProps {
  children: React.ReactNode;
  $primary?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface BrokerItemProps {
  broker: Broker;
  onEdit: (broker: Broker) => void;
  onDelete: (id: string) => void;
}

export interface StockRowProps {
  stock: Stock;
  onToggleTrading: (symbol: string) => void;
  onViewHistory: (stock: Stock) => void;
}
