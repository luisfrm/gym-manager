export interface User {
  _id: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  token: string | null;
  tokenExpiration: Date | null;
}

export interface LoginResponse {
  token: string;
  user: User;
  tokenExpiration: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ValidateTokenResponse {
  _id: string;
  email: string;
  username: string;
  role: string;
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
  _id: string;
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
  client: Client | string; // Puede ser el objeto poblado o solo el ID
  amount: number;
  date: string;
  service: string;
  description?: string;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: "pending" | "paid" | "failed";
  currency: "USD" | "VES";
  createdAt?: Date;
  updatedAt?: Date;
}
