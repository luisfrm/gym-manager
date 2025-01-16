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
  total: number;
  clients: Client[];
  expiringClients: number;
  newClientsLastMonth: number;
}

export interface UpdateClientRequest extends CreateClientRequest {
  _id: string;
}

export interface DeleteClientRequest {
  _id: string;
}
