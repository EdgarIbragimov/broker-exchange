import api from "./axios";
import { Broker, CreateBrokerDto, UpdateBrokerDto } from "../types";

//API для брокеров

const brokersApi = {
  //Полуение всех брокеров
  getAllBrokers: async (): Promise<Broker[]> => {
    const response = await api.get("/brokers");
    return response.data;
  },

  //Получение брокера по ID
  getBrokerById: async (id: string): Promise<Broker> => {
    const response = await api.get(`/brokers/${id}`);
    return response.data;
  },

  //Создание нового брокера
  createBroker: async (brokerData: CreateBrokerDto): Promise<Broker> => {
    const response = await api.post("/brokers", brokerData);
    return response.data;
  },

  //Удаление брокера
  deleteBroker: async (id: string): Promise<void> => {
    await api.delete(`/brokers/${id}`);
  }, 

  //Обновление данных о брокере
  updateBroker: async (id: string, brokerData: UpdateBrokerDto): Promise<Broker> => {
    const response = await api.patch(`/brokers/${id}`, brokerData);
    return response.data;
  }
};

export default brokersApi;