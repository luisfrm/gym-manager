import { API_URL } from "@/lib/config";
import {
  Client,
  ClientStatisticsResponse,
  CreateClientRequest,
  CreatePaymentRequest,
  DeleteClientRequest,
  GetClientsResponse,
  GetLogsResponse,
  LoginRequest,
  LoginResponse,
  Payment,
  RefreshTokenResponse,
  UpdateClientRequest,
  ValidateTokenResponse,
} from "@/lib/types";
import axios from "axios";

const getToken = () => {
  const token = localStorage.getItem("token");
  return token ? JSON.parse(token) : null;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export const loginRequest = async (req: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", req);
  return res.data;
};

export const validateTokenRequest = async (): Promise<ValidateTokenResponse> => {
  const res = await api.get("/auth/validate");
  return res.data;
};

export const getClientsRequest = async (page = 1, limit = 10, search = "", sortField = "updatedAt", sortOrder = "asc"): Promise<GetClientsResponse> => {
  const res = await api.get(`/clients?page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`);
  return res.data;
};

export const getClientByIdRequest = async (cedula: string): Promise<Client> => {
  const res = await api.get(`/clients/${cedula}`);
  return res.data;
};

export const createClientRequest = async (client: CreateClientRequest): Promise<Client> => {
  const res = await api.post("/clients", client);
  return res.data;
};

export const updateClientRequest = async (client: UpdateClientRequest): Promise<Client> => {
  const res = await api.put(`/clients/${client._id}`, client);
  return res.data;
};

export const deleteClientRequest = async ({ _id }: DeleteClientRequest): Promise<Client> => {
  const res = await api.delete(`/clients/${_id}`);
  return res.data;
};

export const getClientStatisticsRequest = async (): Promise<ClientStatisticsResponse> => {
  const res = await api.get("/statistics/clients");
  return res.data;
};

export const getLogsRequest = async (page = 1, limit = 5, search = "", sortField = "updatedAt", sortOrder = "desc"): Promise<GetLogsResponse> => {
  const res = await api.get(`/logs?page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`);
  return res.data;
};

export const createPaymentRequest = async (payment: CreatePaymentRequest): Promise<Payment> => {
  const res = await api.post("/payments", { ...payment, amount: Number(payment.amount) });
  return res.data;
};

export const refreshTokenRequest = async (): Promise<RefreshTokenResponse> => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

