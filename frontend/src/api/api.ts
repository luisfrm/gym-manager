import { API_URL } from "@/lib/config";
import { LoginRequest, LoginResponse } from "@/lib/types";
import axios from "axios";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginRequest = async (req: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", req);
  return res.data;
};