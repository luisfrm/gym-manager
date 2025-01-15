import { API_URL } from "@/lib/config";
import { Client, LoginRequest, LoginResponse, ValidateTokenResponse } from "@/lib/types";
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

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export const loginRequest = async (req: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", req);
  return res.data;
};

export const getClientsRequest = async (): Promise<Client[]> => {
  const res = await api.get("/clients");
  return res.data;
};

export const validateTokenRequest = async (): Promise<ValidateTokenResponse> => {
  const res = await api.get("/auth/validate");
  return res.data;
};
