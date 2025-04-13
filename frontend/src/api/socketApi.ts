import { io, Socket } from "socket.io-client";

// Types
export interface TradingSettings {
  startDate: string;
  speedFactor: number;
  isActive: boolean;
  currentDate?: string;
}

export interface TradingStatus {
  isActive: boolean;
  currentDate: string;
  stockPrices: Array<{
    symbol: string;
    price: string;
  }>;
}

// WebSocket connection
let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (onConnect?: () => void): Socket => {
  if (!socket) {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
    socket = io(API_URL);

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
      onConnect?.();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  return socket;
};

// Helper to safely parse dates
const ensureDateString = (date: any): string => {
  if (!date) return new Date().toISOString();

  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error("Invalid date format:", date);
    return new Date().toISOString();
  }
};

// Subscribe to trading status updates
export const subscribeTradingStatus = (
  callback: (status: TradingStatus) => void
): (() => void) => {
  const socket = initializeSocket();

  socket.on("tradingStatus", (status: any) => {
    try {
      const parsedStatus: TradingStatus = {
        isActive: Boolean(status.isActive),
        currentDate: ensureDateString(status.currentDate),
        stockPrices: Array.isArray(status.stockPrices)
          ? status.stockPrices
          : [],
      };
      callback(parsedStatus);
    } catch (error) {
      console.error("Error parsing trading status:", error, status);
    }
  });

  // Return unsubscribe function
  return () => {
    socket.off("tradingStatus");
  };
};

// Subscribe to trading settings updates
export const subscribeTradingSettings = (
  callback: (settings: TradingSettings) => void
): (() => void) => {
  const socket = initializeSocket();

  socket.on("tradingSettings", (settings: any) => {
    try {
      const parsedSettings: TradingSettings = {
        startDate: ensureDateString(settings.startDate),
        speedFactor: Number(settings.speedFactor) || 1,
        isActive: Boolean(settings.isActive),
        currentDate: settings.currentDate
          ? ensureDateString(settings.currentDate)
          : undefined,
      };
      callback(parsedSettings);
    } catch (error) {
      console.error("Error parsing trading settings:", error, settings);
    }
  });

  // Return unsubscribe function
  return () => {
    socket.off("tradingSettings");
  };
};

// Clean up socket on application exit
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
