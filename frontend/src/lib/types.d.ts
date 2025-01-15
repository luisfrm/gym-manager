export interface User {
  id: string;
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
  id: string;
  email: string;
  username: string;
  role: string;
  tokenExpiration: Date;
}

export interface Client {
  id: string;
  cedula: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  expiredDate?: string;
  isActive?: boolean;
}