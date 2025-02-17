export type Role = "admin" | "employee";

export interface User {
  _id: string;
  email: string;
  username: string;
  role: Role;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  token: string;
  tokenExpiration: string | null;
}

export interface TokenState {
  token: string;
  tokenExpiration: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  tokenExpiration: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ValidateTokenResponse {
  _id: string;
  email: string;
  username: string;
  role: Role;
  tokenExpiration: Date;
}

export interface Client {
  _id: string;
  cedula: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  expiredDate: string;
}

export interface CreateClientRequest {
  cedula: string;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  address?: string;
  expiredDate: string;
}

export interface GetClientsResponse {
  info: {
    total: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Client[];
}

export interface UpdateClientRequest extends CreateClientRequest {
  _id?: string;
}

export interface UpdatePartialPaymentRequest {
  _id?: string;
  client?: Client; // Puede ser el objeto poblado o solo la cedula
  clientCedula?: string;
  amount?: string;
  date?: string;
  service?: string;
  description?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  currency?: "USD" | "VES";
}

export interface DeleteClientRequest {
  _id: string;
}

export interface ClientStatisticsResponse {
  newClientsLastMonth: number;
  clientsExpiringNextWeek: number;
  totalClients: number;
}

export interface LogUser {
  _id: string;
  name: string;
  email: string;
}

export interface Log {
  _id: string;
  message: string;
  user: LogUser;
  type: "created" | "updated" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export interface GetLogsResponse {
  info: {
    total: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Log[];
}

export interface Payment {
  _id: string;
  client: Client; // Puede ser el objeto poblado o solo la cedula
  clientCedula: string;
  amount: string;
  date: string;
  service: string;
  description?: string;
  paymentMethod: string;
  paymentReference?: string;
  paymentStatus: "pending" | "paid" | "failed";
  currency: "USD" | "VES";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePaymentRequest {
  client: string;
  clientCedula: string;
  amount: string;
  date: string;
  service: string;
  paymentMethod: string;
  paymentReference?: string;
  expiredDate: string;
  paymentStatus: "pending" | "paid" | "failed";
  currency: "USD" | "VES";
}

export interface UpdatePartialPaymentRequest {
  amount?: string;
  date: string;
  service?: string;
  paymentMethod?: string;
  paymentReference?: string;
  expiredDate?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  currency?: "USD" | "VES";
}

export interface GetPaymentsResponse {
  info: {
    total: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Payment[];
}

export interface RefreshTokenResponse {
  token: string;
  tokenExpiration: string;
}
