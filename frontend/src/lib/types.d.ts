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
  hasFaceRegistered?: boolean;
  faceImagePath?: string;
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
  amount?: number;
  date?: string;
  service?: string;
  paymentMethod?: string;
  paymentReference?: string;
  description?: string;
  expiredDate?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  currency?: "USD" | "VES";
}

export interface DeleteClientRequest {
  _id: string;
}

export interface ClientStatisticsResponse {
  newClientsLastMonth: number;
  clientsExpiringNextWeek: number;
  clientsExpiringNext30Days: number;
  activeClients: number;
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

export interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onPaymentCreated?: () => void;
}

export interface RefreshTokenResponse {
  token: string;
  tokenExpiration: string;
}

// #Mark: Suggestions Dropdown
export interface SuggestionOption {
  id: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  data?: any;
}

export interface SuggestionsDropdownProps {
  options: SuggestionOption[];
  searchValue: string;
  onSelect: (option: SuggestionOption) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  groupHeading?: string;
  className?: string;
}

// ===================================
// #region PROFILE MANAGEMENT
// ===================================

export interface ProfileData {
  _id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "employee";
}

export interface CreateUserResponse {
  message: string;
  user: ProfileData;
}

// #endregion PROFILE MANAGEMENT

// ===================================
// #region BACKUP MANAGEMENT
// ===================================

export interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
  type: "manual" | "automatic";
}

export interface BackupConfiguration {
  automaticBackup: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
}

// #endregion BACKUP MANAGEMENT

// ===================================
// #region UI CONFIGURATION
// ===================================

export interface UIConfiguration {
  theme: "light" | "dark" | "system";
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: "public" | "private" | "friends";
}

export interface AppConfiguration extends UIConfiguration, BackupConfiguration {}

// #endregion UI CONFIGURATION
