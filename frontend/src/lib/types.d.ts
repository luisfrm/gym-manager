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
  isOpen: boolean;
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

// #region REPORTS
export type ReportType = 
  | "daily"
  | "date_specific" 
  | "last_7_days"
  | "current_week"
  | "current_month"
  | "month_specific"
  | "income_summary"
  | "client_summary";

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmountUSD: number;
  totalAmountVES: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  paymentMethods: Record<string, number>;
  services: Record<string, number>;
  dailyBreakdown: Record<string, {
    count: number;
    amountUSD: number;
    amountVES: number;
  }>;
}

export interface PaymentsReportResponse {
  reportType: ReportType;
  dateRange: ReportDateRange;
  currency: string;
  stats: PaymentStats;
  payments: Payment[];
}

export interface ClientStats {
  totalClients: number;
  newClientsInPeriod: number;
  clientsWithPayments: number;
  clientsWithFaceRecognition: number;
  activeClients: number;
  expiredClients: number;
  clientsByMonth: Record<string, number>;
}

export interface ClientPaymentSummary {
  client: Client;
  paymentCount: number;
  totalAmountUSD: number;
  totalAmountVES: number;
  lastPayment: Date | null;
}

export interface ClientsReportResponse {
  reportType: ReportType;
  dateRange: ReportDateRange;
  stats: ClientStats;
  newClients: Client[];
  clientPaymentSummary: ClientPaymentSummary[];
}

export interface IncomeSummary {
  totalIncomeUSD: number;
  totalIncomeVES: number;
  totalTransactions: number;
  averageTransactionUSD: number;
  averageTransactionVES: number;
}

export interface IncomeByMethod {
  method: string;
  currency: string;
  amount: number;
  count: number;
}

export interface IncomeByService {
  service: string;
  currency: string;
  amount: number;
  count: number;
}

export interface DailyIncome {
  date: string;
  amountUSD: number;
  amountVES: number;
  count: number;
}

export interface IncomeSummaryReportResponse {
  reportType: ReportType;
  dateRange: ReportDateRange;
  summary: IncomeSummary;
  incomeByMethod: IncomeByMethod[];
  incomeByService: IncomeByService[];
  dailyIncome: DailyIncome[];
}

export interface DashboardOverview {
  today: {
    incomeUSD: number;
    incomeVES: number;
    transactionCount: number;
  };
  month: {
    incomeUSD: number;
    incomeVES: number;
    transactionCount: number;
    newClients: number;
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
  };
}

export interface ReportRequest {
  reportType: ReportType;
  specificDate?: string;
  specificMonth?: string;
  currency?: "USD" | "VES" | "ALL";
}

// ===================================
// #region DETAILED REPORTS
// ===================================

export interface DetailedClientSummary {
  totalClients: number;
  expiredClients: number;
  activeClients: number;
  renewedClients: number;
  newClients: number;
  clientsAtRisk: number;
  clientsWithFace: number;
  premium: number;
  regular: number;
  basic: number;
}

export interface ClientDetail {
  _id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  expiredDate?: string;
  daysExpired?: number;
  daysUntilExpiry?: number | null;
  hasFaceRegistered: boolean;
  createdAt?: string;
  daysAsClient?: number;
}

export interface RenewedClientDetail {
  client: Client;
  paymentsCount: number;
  totalAmountUSD: number;
  totalAmountVES: number;
  lastPaymentDate: string;
}

export interface DetailedClientsReportResponse {
  reportType: string;
  month: string;
  dateRange: ReportDateRange;
  summary: DetailedClientSummary;
  expiredClients: ClientDetail[];
  activeClients: ClientDetail[];
  renewedClients: RenewedClientDetail[];
  newClients: ClientDetail[];
  clientsAtRisk: ClientDetail[];
}

export interface PaymentAnalytics {
  dailyTrends: Record<string, {
    date: string;
    paid: number;
    pending: number;
    failed: number;
    totalAmount: {
      USD: number;
      VES: number;
    };
  }>;
  methodPerformance: Record<string, {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    successRate: number;
    totalAmount: {
      USD: number;
      VES: number;
    };
  }>;
  serviceAnalytics: Record<string, {
    count: number;
    revenue: {
      USD: number;
      VES: number;
    };
    avgAmount: {
      USD: number;
      VES: number;
    };
    successRate: number;
    paid: number;
  }>;
  currencyDistribution: {
    USD: {
      count: number;
      amount: number;
      percentage: number;
    };
    VES: {
      count: number;
      amount: number;
      percentage: number;
    };
  };
  clientBehavior: {
    newCustomers: number;
    returningCustomers: number;
    averagePaymentValue: {
      USD: number;
      VES: number;
    };
    topSpenders: Array<{
      client: Client;
      totalUSD: number;
      totalVES: number;
      paymentCount: number;
    }>;
  };
  timeAnalytics: {
    peakDays: Record<string, number>;
    averagePaymentsPerDay: number;
    successRate: number;
    responseTime: string;
  };
}

export interface DetailedPaymentSummary {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  successRate: number;
  totalRevenueUSD: number;
  totalRevenueVES: number;
  averageTransactionUSD: number;
  averageTransactionVES: number;
}

export interface PendingPaymentDetail extends Payment {
  daysPending: number;
}

export interface FailedPaymentDetail extends Payment {
  failureReason: string;
}

export interface DetailedPaymentsReportResponse {
  reportType: string;
  month: string;
  dateRange: ReportDateRange;
  summary: DetailedPaymentSummary;
  paidPayments: Payment[];
  pendingPayments: PendingPaymentDetail[];
  failedPayments: FailedPaymentDetail[];
  highValueTransactions: Payment[];
  analytics: PaymentAnalytics | null;
}

// #endregion DETAILED REPORTS

// #endregion REPORTS
