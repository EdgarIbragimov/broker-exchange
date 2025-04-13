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

// Reusable error handler
const handleApiError = (error: any) => {
  return error.response?.data?.message || "Operation failed";
};

// Async thunks
export const fetchTradingSettings = createAsyncThunk(
  "marketSettings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const settings = await tradingApi.getTradingSettings();
      return {
        tradingStartDate: settings.startDate,
        dateChangeRate: settings.speedFactor,
        currentDate: settings.currentDate || "",
        isTradingActive: settings.isActive,
      };
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
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
      const settingsDTO: TradingSettingsDTO = {
        startDate,
        speedFactor,
      };

      const settings = await tradingApi.updateTradingSettings(settingsDTO);

      return {
        tradingStartDate: settings.startDate,
        dateChangeRate: settings.speedFactor,
        currentDate: settings.currentDate || "",
        isTradingActive: settings.isActive,
      };
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
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
        currentDate: tradingStatus.currentDate,
      };
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
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
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const resetSimulation = createAsyncThunk(
  "marketSettings/resetSimulation",
  async (_, { rejectWithValue }) => {
    try {
      const tradingStatus = await tradingApi.resetSimulation();
      return {
        isTradingActive: tradingStatus.isActive,
        currentDate: tradingStatus.currentDate,
      };
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const marketSettingsSlice = createSlice({
  name: "marketSettings",
  initialState,
  reducers: {
    updateTradingStatus: (state, action: PayloadAction<TradingStatus>) => {
      state.currentDate = action.payload.currentDate;
      state.isTradingActive = action.payload.isActive;
    },
    resetErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Generic pending handler
    const addPendingCase = (thunk: any) => {
      builder.addCase(thunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      });
    };

    // Generic rejected handler
    const addRejectedCase = (thunk: any) => {
      builder.addCase(thunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    };

    // Add pending and rejected cases for all thunks
    [
      fetchTradingSettings,
      updateTradingSettings,
      startTrading,
      stopTrading,
      resetSimulation,
    ].forEach((thunk) => {
      addPendingCase(thunk);
      addRejectedCase(thunk);
    });

    // Specific fulfilled handlers
    builder
      .addCase(fetchTradingSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.tradingStartDate = action.payload.tradingStartDate;
        state.dateChangeRate = action.payload.dateChangeRate;
        state.currentDate = action.payload.currentDate;
        state.isTradingActive = action.payload.isTradingActive;
      })
      .addCase(updateTradingSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.tradingStartDate = action.payload.tradingStartDate;
        state.dateChangeRate = action.payload.dateChangeRate;
        state.currentDate = action.payload.currentDate;
        state.isTradingActive = action.payload.isTradingActive;
      })
      .addCase(startTrading.fulfilled, (state, action) => {
        state.loading = false;
        state.isTradingActive = action.payload.isTradingActive;
        state.currentDate = action.payload.currentDate;
      })
      .addCase(stopTrading.fulfilled, (state, action) => {
        state.loading = false;
        state.isTradingActive = action.payload.isTradingActive;
      })
      .addCase(resetSimulation.fulfilled, (state, action) => {
        state.loading = false;
        state.isTradingActive = action.payload.isTradingActive;
        state.currentDate = action.payload.currentDate;
      });
  },
});

export const { updateTradingStatus, resetErrors } = marketSettingsSlice.actions;
export default marketSettingsSlice.reducer;
