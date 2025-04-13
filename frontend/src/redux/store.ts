import { configureStore } from "@reduxjs/toolkit";
import brokersReducer from "./slices/brokersSlice";
import stocksReducer from "./slices/stocksSlice";
import marketSettingsReducer from "./slices/marketSettingsSlice";

export const store = configureStore({
  reducer: {
    brokers: brokersReducer,
    stocks: stocksReducer,
    marketSettings: marketSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
