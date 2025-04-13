import api from "./axios";

interface TradingSettings {
  startDate: Date;
  speedFactor: number;
  isActive: boolean;
  currentDate?: Date;
}

// DTO для отправки на сервер - соответствует TradingSettingsDto в бэкенде
export interface TradingSettingsDTO {
  startDate: Date;
  speedFactor: number;
  isActive?: boolean;
}

interface TradingStatus {
  isActive: boolean;
  currentDate: Date;
  stockPrices: Array<{
    symbol: string;
    price: string;
  }>;
}

// Get current trading settings
export const getTradingSettings = async (): Promise<TradingSettings> => {
  try {
    const response = await api.get<TradingSettings>("/trading/settings");

    // Преобразуем строковые даты в объекты Date
    const data = response.data;
    return {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      currentDate: data.currentDate ? new Date(data.currentDate) : undefined,
    };
  } catch (error) {
    console.error("Error fetching trading settings:", error);
    // Возвращаем значения по умолчанию, если API недоступно
    return {
      startDate: new Date(),
      speedFactor: 1,
      isActive: false,
    };
  }
};

// Update trading settings
export const updateTradingSettings = async (
  settings: Partial<TradingSettingsDTO>
): Promise<TradingSettings> => {
  try {
    console.log("Sending settings to API:", settings);

    // Передаем данные в формате, ожидаемом сервером
    const response = await api.patch<TradingSettings>(
      "/trading/settings",
      settings
    );

    // Преобразуем строковые даты в объекты Date
    const data = response.data;
    return {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      currentDate: data.currentDate ? new Date(data.currentDate) : undefined,
    };
  } catch (error) {
    console.error("Error updating trading settings:", error);
    throw error;
  }
};

// Start trading simulation
export const startTrading = async (): Promise<TradingStatus> => {
  try {
    const response = await api.post<TradingStatus>("/trading/start");
    const data = response.data;

    // Проверяем и преобразуем дату
    return {
      ...data,
      currentDate: data.currentDate ? new Date(data.currentDate) : new Date(),
    };
  } catch (error) {
    console.error("Error starting trading:", error);
    throw error;
  }
};

// Stop trading simulation
export const stopTrading = async (): Promise<void> => {
  try {
    await api.post("/trading/stop");
  } catch (error) {
    console.error("Error stopping trading:", error);
    throw error;
  }
};
