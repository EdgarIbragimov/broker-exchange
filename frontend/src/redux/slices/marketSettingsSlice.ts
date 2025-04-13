import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MarketSettingsState } from "../../types";
import * as tradingApi from "../../api/tradingApi";
import { TradingSettingsDTO } from "../../api/tradingApi";
import { TradingStatus } from "../../api/socketApi";

// Initial state
const initialState: MarketSettingsState = {
  tradingStartDate: new Date().toISOString(),
  dateChangeRate: 1,
  currentDate: "",
  isTradingActive: false,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTradingSettings = createAsyncThunk(
  "marketSettings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const settings = await tradingApi.getTradingSettings();
      return {
        tradingStartDate: settings.startDate.toISOString(),
        dateChangeRate: settings.speedFactor,
        currentDate: settings.currentDate
          ? settings.currentDate.toISOString()
          : "",
        isTradingActive: settings.isActive,
      };
    } catch (error: any) {
      console.error("Redux error fetching settings:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to load trading settings"
      );
    }
  }
);

export const updateTradingSettings = createAsyncThunk(
  "marketSettings/updateSettings",
  async (
    { startDate, speedFactor }: { startDate: Date; speedFactor: number },
    { rejectWithValue }
  ) => {
    try {
      // Создаем объект, соответствующий DTO на бэкенде
      const settingsDTO: TradingSettingsDTO = {
        startDate,
        speedFactor,
        // isActive не отправляем, чтобы не менять текущее состояние
      };

      const settings = await tradingApi.updateTradingSettings(settingsDTO);

      return {
        tradingStartDate: settings.startDate.toISOString(),
        dateChangeRate: settings.speedFactor,
        currentDate: settings.currentDate
          ? settings.currentDate.toISOString()
          : "",
        isTradingActive: settings.isActive,
      };
    } catch (error: any) {
      console.error("Redux error updating settings:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update trading settings"
      );
    }
  }
);

export const startTrading = createAsyncThunk(
  "marketSettings/startTrading",
  async (_, { rejectWithValue }) => {
    try {
      const tradingStatus = await tradingApi.startTrading();
      return {
        isTradingActive: tradingStatus.isActive,
        currentDate: tradingStatus.currentDate.toISOString(),
      };
    } catch (error: any) {
      console.error("Redux error starting trading:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to start trading"
      );
    }
  }
);

export const stopTrading = createAsyncThunk(
  "marketSettings/stopTrading",
  async (_, { rejectWithValue }) => {
    try {
      await tradingApi.stopTrading();
      return {
        isTradingActive: false,
      };
    } catch (error: any) {
      console.error("Redux error stopping trading:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to stop trading"
      );
    }
  }
);

// Slice
const marketSettingsSlice = createSlice({
  name: "marketSettings",
  initialState,
  reducers: {
    updateTradingStatus: (state, action: PayloadAction<TradingStatus>) => {
      state.currentDate = action.payload.currentDate.toISOString();
      state.isTradingActive = action.payload.isActive;
    },
    resetErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchTradingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTradingSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.tradingStartDate = action.payload.tradingStartDate;
        state.dateChangeRate = action.payload.dateChangeRate;
        state.currentDate = action.payload.currentDate;
        state.isTradingActive = action.payload.isTradingActive;
      })
      .addCase(fetchTradingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update settings
      .addCase(updateTradingSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTradingSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.tradingStartDate = action.payload.tradingStartDate;
        state.dateChangeRate = action.payload.dateChangeRate;
        state.currentDate = action.payload.currentDate;
        state.isTradingActive = action.payload.isTradingActive;
      })
      .addCase(updateTradingSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Start trading
      .addCase(startTrading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTrading.fulfilled, (state, action) => {
        state.loading = false;
        state.isTradingActive = action.payload.isTradingActive;
        state.currentDate = action.payload.currentDate;
      })
      .addCase(startTrading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Stop trading
      .addCase(stopTrading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopTrading.fulfilled, (state, action) => {
        state.loading = false;
        state.isTradingActive = action.payload.isTradingActive;
      })
      .addCase(stopTrading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateTradingStatus, resetErrors } = marketSettingsSlice.actions;
export default marketSettingsSlice.reducer;
