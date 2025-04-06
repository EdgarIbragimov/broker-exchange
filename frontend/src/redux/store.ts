import { configureStore } from "@reduxjs/toolkit"
import brokersReducer from "./slices/brokersSlice"
import stocksReducer from "./slices/stocksSlice"

export const store = configureStore({
  reducer: {
    brokers: brokersReducer,
    stocks: stocksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;