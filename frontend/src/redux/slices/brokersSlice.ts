import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Broker,
  BrokersState,
  CreateBrokerDto,
  UpdateBrokerDto,
} from "../../types";
import brokersApi from "../../api/brokersApi";
import { StringLiteral } from "typescript";

//Описываем начальное состояние для редьюсера
const initialState: BrokersState = {
  brokers: [],
  currentBroker: null,
  loading: false,
  error: null,
};

//Thunk для загрузки всех брокеров
export const fetchBrokers = createAsyncThunk(
  "brokers/fetchBrokers",
  async (_, { rejectWithValue }) => {
    try {
      return await brokersApi.getAllBrokers();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось загрузить брокеров"
      );
    }
  }
);

//Thunc для загрузки брокера по его Id
export const fetchBrokerById = createAsyncThunk(
  "brokers/fetchBrokerById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await brokersApi.getBrokerById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось загрузить брокера"
      );
    }
  }
);

//Thunc для создания нового брокера
export const createBroker = createAsyncThunk(
  "brokers/createBroker",
  async (data: CreateBrokerDto, { rejectWithValue }) => {
    try {
      return await brokersApi.createBroker(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось создать брокера"
      );
    }
  }
);

//Thunc для удаления брокер
export const deleteBroker = createAsyncThunk(
  "brokers/deleteBroker",
  async (id: string, { rejectWithValue }) => {
    try {
      await brokersApi.deleteBroker(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось удалить брокера"
      );
    }
  }
);

//Thunc для обновления данных о брокере
export const updateBroker = createAsyncThunk(
  "brokers/updateBroker",
  async (
    data: { id: string; updates: UpdateBrokerDto },
    { rejectWithValue }
  ) => {
    try {
      const { id, updates } = data;
      return await brokersApi.updateBroker(id, updates);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Не удалось обновить данные брокера"
      );
    }
  }
);

const brokersSlice = createSlice({
  name: "brokers",
  initialState,
  reducers: {
    resetCurrentBroker: (state) => {
      state.currentBroker = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    //Обработка fetchBrokers
    builder
      .addCase(fetchBrokers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBrokers.fulfilled,
        (state, action: PayloadAction<Broker[]>) => {
          state.brokers = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchBrokers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Обработка fetchBrokerById
    builder
      .addCase(fetchBrokerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBrokerById.fulfilled,
        (state, action: PayloadAction<Broker>) => {
          state.currentBroker = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchBrokerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //Обработка createBroker
    builder
      .addCase(createBroker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createBroker.fulfilled,
        (state, action: PayloadAction<Broker>) => {
          state.brokers.push(action.payload);
          state.loading = false;
        }
      )
      .addCase(createBroker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //Обработка deleteBroker
    builder
      .addCase(deleteBroker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteBroker.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.brokers = state.brokers.filter(
            (broker) => broker.id !== action.payload
          );
          if (state.currentBroker?.id === action.payload) {
            state.currentBroker = null;
          }
          state.loading = false;
        }
      )
      .addCase(deleteBroker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //Обработка updateBroker
    builder
      .addCase(updateBroker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateBroker.fulfilled,
        (state, action: PayloadAction<Broker>) => {
          const updatedBroker = action.payload;
          const index = state.brokers.findIndex(
            (broker) => broker.id === updatedBroker.id
          );
          if (index !== -1) {
            state.brokers[index] = updatedBroker;
          }
          if (state.currentBroker?.id === updatedBroker.id) {
            state.currentBroker = updatedBroker;
          }
          state.loading = false;
        }
      )
      .addCase(updateBroker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetCurrentBroker } = brokersSlice.actions;
export default brokersSlice.reducer;
