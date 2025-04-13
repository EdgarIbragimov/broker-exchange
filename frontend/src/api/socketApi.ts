import { io, Socket } from "socket.io-client";

// Types
export interface TradingSettings {
  startDate: Date;
  speedFactor: number;
  isActive: boolean;
  currentDate?: Date;
}

export interface TradingStatus {
  isActive: boolean;
  currentDate: Date;
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

// Subscribe to trading status updates
export const subscribeTradingStatus = (
  callback: (status: TradingStatus) => void
): (() => void) => {
  const socket = initializeSocket();

  socket.on("tradingStatus", (status: any) => {
    try {
      // Parse dates from strings
      const parsedStatus: TradingStatus = {
        ...status,
        isActive: status.isActive || false,
        currentDate: status.currentDate
          ? new Date(status.currentDate)
          : new Date(),
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
      // Parse dates from strings
      const parsedSettings: TradingSettings = {
        ...settings,
        startDate: settings.startDate
          ? new Date(settings.startDate)
          : new Date(),
        speedFactor: settings.speedFactor || 1,
        isActive: settings.isActive || false,
        currentDate: settings.currentDate
          ? new Date(settings.currentDate)
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
