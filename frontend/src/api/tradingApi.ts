import api from "./axios";

// Интерфейсы содержат строки для дат вместо объектов Date
interface TradingSettings {
  startDate: string; // ISO string
  speedFactor: number;
  isActive: boolean;
  currentDate?: string; // ISO string или undefined
}

// DTO для отправки на сервер - соответствует TradingSettingsDto в бэкенде
export interface TradingSettingsDTO {
  startDate: Date; // Объект Date для отправки
  speedFactor: number;
  isActive?: boolean;
}

interface TradingStatus {
  isActive: boolean;
  currentDate: string; // ISO string
  stockPrices: Array<{
    symbol: string;
    price: string;
  }>;
}

// Helper function to ensure dates are ISO strings
const formatDateResponse = (data: any): any => {
  if (!data) return data;

  if (data.startDate) {
    data.startDate =
      data.startDate instanceof Date
        ? data.startDate.toISOString()
        : new Date(data.startDate).toISOString();
  }

  if (data.currentDate) {
    data.currentDate =
      data.currentDate instanceof Date
        ? data.currentDate.toISOString()
        : new Date(data.currentDate).toISOString();
  }

  return data;
};

// Получение текущих настроек торгов
export const getTradingSettings = async (): Promise<TradingSettings> => {
  try {
    const response = await api.get<any>("/trading/settings");
    return formatDateResponse(response.data);
  } catch (error) {
    console.error("Error fetching trading settings:", error);
    // Возвращаем значения по умолчанию, если API недоступно
    return {
      startDate: new Date().toISOString(),
      speedFactor: 1,
      isActive: false,
    };
  }
};

// Обновление настроек торгов
export const updateTradingSettings = async (
  settings: Partial<TradingSettingsDTO>
): Promise<TradingSettings> => {
  try {
    const response = await api.patch<any>("/trading/settings", settings);
    return formatDateResponse(response.data);
  } catch (error) {
    console.error("Error updating trading settings:", error);
    throw error;
  }
};

// Запуск симуляции торгов
export const startTrading = async (): Promise<TradingStatus> => {
  try {
    const response = await api.post<any>("/trading/start");
    return formatDateResponse(response.data);
  } catch (error) {
    console.error("Error starting trading:", error);
    throw error;
  }
};

// Остановка симуляции торгов
export const stopTrading = async (): Promise<void> => {
  try {
    await api.post("/trading/stop");
  } catch (error) {
    console.error("Error stopping trading:", error);
    throw error;
  }
};

// Сброс данных симуляции
export const resetSimulation = async (): Promise<TradingStatus> => {
  try {
    const response = await api.post<TradingStatus>("/trading/reset");
    return formatDateResponse(response.data);
  } catch (error) {
    console.error("Error resetting simulation data:", error);
    throw error;
  }
};
