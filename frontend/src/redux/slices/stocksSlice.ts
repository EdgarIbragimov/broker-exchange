import { createSlice, createAsyncThunk, PayloadAction, isRejectedWithValue } from "@reduxjs/toolkit";
import { Stock, StocksState } from "../../types";
import stocksApi from "../../api/stocksApi";

const initialState: StocksState = {
  stocks: [],
  selectedStock: null,
  loading: false,
  error: null,
};

export const fetchStocks = createAsyncThunk(
  "stocks/fetchStocks",
  async (_, { rejectWithValue }) => {
    try {
      return await stocksApi.getAllStocks();
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Не удалось загрузить акции");
    }
  }
);

export const fetchStockBySymbol = createAsyncThunk(
  "stocks/fetchStockBySymbol",
  async (symbol: string, { rejectWithValue }) => {
    try {
      return await stocksApi.getStockBySymbol(symbol);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Не удалось загрузить данные об акции");
    }
  }
);
  
export const toggleStockTrading = createAsyncThunk(
  "stocks/toggleStockTrading",
  async ({ symbol, useInTrading }: { symbol: string; useInTrading: boolean }, { rejectWithValue }) => {
    try {
      return await stocksApi.updateStockTradingStatus(symbol, useInTrading);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update stock status");
    }
  }
);

const stocksSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    setSelectedStock: (state, action: PayloadAction<string | null>) => {
      state.selectedStock = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchStocks
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action: PayloadAction<Stock[]>) => {
        state.loading = false;
        state.stocks = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchStockBySymbol
      .addCase(fetchStockBySymbol.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockBySymbol.fulfilled, (state, action: PayloadAction<Stock>) => {
        state.loading = false;
        const index = state.stocks.findIndex(stock => stock.symbol === action.payload.symbol);
        if (index !== -1) {
          state.stocks[index] = action.payload;
        } else {
          state.stocks.push(action.payload);
        }
      })
      .addCase(fetchStockBySymbol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Обработка toggleStockTrading
      .addCase(toggleStockTrading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleStockTrading.fulfilled, (state, action: PayloadAction<Stock>) => {
        state.loading = false;
        const index = state.stocks.findIndex(stock => stock.symbol === action.payload.symbol);
        if (index !== -1) {
          state.stocks[index] = action.payload;
        }
      })
      .addCase(toggleStockTrading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedStock } = stocksSlice.actions;
export default stocksSlice.reducer;