import { API_URL } from "@/lib/config";
import {
  Client,
  ClientStatisticsResponse,
  CreateClientRequest,
  CreatePaymentRequest,
  DeleteClientRequest,
  GetClientsResponse,
  GetLogsResponse,
  GetPaymentsResponse,
  LoginRequest,
  LoginResponse,
  Payment,
  RefreshTokenResponse,
  UpdateClientRequest,
  UpdatePartialPaymentRequest,
  ValidateTokenResponse,
  // Profile Management Types
  ProfileData,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  CreateUserResponse,
  // Backup Management Types
  BackupFile,
} from "@/lib/types";
import axios from "axios";
import { useStore } from "@/hooks/useStore";

// Function to get token from local storage. Uncomment if needed.
// const getToken = () => {
//   const AppStore = localStorage.getItem("AppStore") || "";
//   const AppStoreParsed = JSON.parse(AppStore);
//   const token = AppStoreParsed.state.auth.token;
//   return token;
// };

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(config => {
  const token = useStore.getState().auth.token;
  // const token = getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ===================================
// #region SERVER HEALTH
// ===================================

export const pingServer = async (): Promise<{ status: string }> => {
  const res = await api.get("/ping");
  return res.data;
};

// #endregion SERVER HEALTH

// ===================================
// #region AUTHENTICATION
// ===================================

export const loginRequest = async (req: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", req);
  return res.data;
};

export const validateTokenRequest = async (): Promise<ValidateTokenResponse> => {
  const res = await api.get("/auth/validate");
  return res.data;
};

export const refreshTokenRequest = async (): Promise<RefreshTokenResponse> => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

// #endregion AUTHENTICATION

// ===================================
// #region PROFILE MANAGEMENT
// ===================================

export const getProfileRequest = async (): Promise<ProfileData> => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al cargar el perfil');
  }
};

export const updateProfileRequest = async (data: UpdateProfileRequest): Promise<{ message: string; user: ProfileData }> => {
  try {
    const response = await api.put('/profile', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al actualizar el perfil');
  }
};

export const changePasswordRequest = async (data: ChangePasswordRequest): Promise<{ message: string }> => {
  try {
    const response = await api.put('/profile/password', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al cambiar la contraseña');
  }
};

export const createUserRequest = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al crear el usuario');
  }
};

// #endregion PROFILE MANAGEMENT

// ===================================
// #region BACKUP MANAGEMENT
// ===================================

export const generateBackupRequest = async (): Promise<Blob> => {
  try {
    const response = await api.post('/backup/generate', {}, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al generar el backup');
  }
};

export const getBackupHistoryRequest = async (): Promise<BackupFile[]> => {
  try {
    const response = await api.get('/backup/history');
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al obtener el historial de backups');
  }
};

export const downloadBackupRequest = async (filename: string): Promise<Blob> => {
  try {
    const response = await api.get(`/backup/download/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al descargar el backup');
  }
};

// #endregion BACKUP MANAGEMENT

// ===================================
// #region CLIENT MANAGEMENT
// ===================================

export const getClientsRequest = async (
  search = "",
  page = 1,
  limit = 10,
  sortField = "updatedAt",
  sortOrder = "asc",
): Promise<GetClientsResponse> => {
  const res = await api.get(
    `/clients?page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`,
  );
  return res.data;
};

export const getClientByIdRequest = async (cedula: string): Promise<Client> => {
  const res = await api.get(`/clients/${cedula}`);
  return res.data;
};

export const createClientRequest = async (
  client: CreateClientRequest, 
  faceData?: { encoding: number[]; image: string }
): Promise<Client> => {
  const requestData = {
    ...client,
    // Add facial encoding if present
    ...(faceData && { faceEncoding: faceData.encoding })
  };
  
  const res = await api.post("/clients", requestData);
  return res.data;
};

export const updateClientRequest = async (client: UpdateClientRequest): Promise<Client> => {
  const clientData = { ...client };
  if (clientData && clientData._id) delete clientData._id;
  const res = await api.put(`/clients/${client._id}`, clientData);
  return res.data;
};

export const deleteClientRequest = async ({ _id }: DeleteClientRequest): Promise<Client> => {
  const res = await api.delete(`/clients/${_id}`);
  return res.data;
};

export const createClientWithPaymentRequest = async (
  clientData: CreateClientRequest,
  paymentData: Omit<CreatePaymentRequest, 'client' | 'clientCedula'>,
  faceData?: { encoding: number[]; image: string }
): Promise<{ client: Client; payment: Payment; message: string }> => {
  const combinedData = {
    // Client data
    ...clientData,
    // Payment data
    amount: paymentData.amount,
    date: paymentData.date,
    service: paymentData.service,
    paymentMethod: paymentData.paymentMethod,
    paymentReference: paymentData.paymentReference,
    paymentStatus: paymentData.paymentStatus,
    currency: paymentData.currency,
    // Add facial encoding if present
    ...(faceData && { faceEncoding: faceData.encoding })
  };

  const res = await api.post("/clients/with-payment", combinedData);
  return res.data;
};

// #endregion CLIENT MANAGEMENT

// ===================================
// #region PAYMENT MANAGEMENT
// ===================================

export const getClientPaymentsRequest = async (cedula: string): Promise<Payment[]> => {
  const res = await api.get(`/payments/by-client/${cedula}`);
  return res.data;
};

export const getPaymentsRequest = async (
  page = 1,
  limit = 10,
  search = "",
  sortField = "updatedAt",
  sortOrder = "asc",
): Promise<GetPaymentsResponse> => {
  const res = await api.get(
    `/payments?page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`,
  );
  return res.data;
};

export const createPaymentRequest = async (payment: CreatePaymentRequest): Promise<Payment> => {
  const res = await api.post("/payments", { ...payment, amount: Number(payment.amount) });
  return res.data;
};

export const updatePartialPaymentRequest = async (payment: UpdatePartialPaymentRequest) => {
  const paymentData = { ...payment };
  delete paymentData._id;
  const res = await api.patch(`/payments/${payment._id}`, paymentData);
  return res.data;
};

export const updatePaymentStatusRequest = async ({ _id, paymentStatus }: UpdatePartialPaymentRequest) => {
  const res = await api.patch(`/payments//paymentStatus/${_id}`, { paymentStatus });
  return res.data;
};

export const getPaymentTotalsRequest = async () => {
  const response = await api.get("/payments/totals");
  return response.data;
};

// #endregion PAYMENT MANAGEMENT

// ===================================
// #region STATISTICS & LOGS
// ===================================

export const getClientStatisticsRequest = async (): Promise<ClientStatisticsResponse> => {
  const res = await api.get("/statistics/clients");
  return res.data;
};

export const getLogsRequest = async (
  page = 1,
  limit = 5,
  search = "",
  sortField = "updatedAt",
  sortOrder = "desc",
): Promise<GetLogsResponse> => {
  const res = await api.get(
    `/logs?page=${page}&limit=${limit}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`,
  );
  return res.data;
};

// #endregion STATISTICS & LOGS

// ===================================
// #region FACE RECOGNITION
// ===================================

export const registerFace = async (clientId: string, encoding: number[]): Promise<any> => {
  const res = await api.post("/face/register", {
    clientId,
    faceEncoding: encoding
  });
  return res.data;
};

export const faceLoginRequest = async (encodedImage: string): Promise<{ success: boolean, clientData?: any, message: string }> => {
  try {
    const response = await api.post('/face/login', { encodedImage });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error en el reconocimiento facial');
  }
};

// #endregion FACE RECOGNITION

// ===================================
// #region REPORTS
// ===================================

export const getPaymentsReportRequest = async (params: {
  reportType: string;
  specificDate?: string;
  specificMonth?: string;
  currency?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', params.reportType);
    if (params.specificDate) queryParams.append('specificDate', params.specificDate);
    if (params.specificMonth) queryParams.append('specificMonth', params.specificMonth);
    if (params.currency) queryParams.append('currency', params.currency);

    const response = await api.get(`/reports/payments?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al generar el reporte de pagos');
  }
};

export const getClientsReportRequest = async (params: {
  reportType: string;
  specificDate?: string;
  specificMonth?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', params.reportType);
    if (params.specificDate) queryParams.append('specificDate', params.specificDate);
    if (params.specificMonth) queryParams.append('specificMonth', params.specificMonth);

    const response = await api.get(`/reports/clients?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al generar el reporte de clientes');
  }
};

export const getIncomeSummaryReportRequest = async (params: {
  reportType: string;
  specificDate?: string;
  specificMonth?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', params.reportType);
    if (params.specificDate) queryParams.append('specificDate', params.specificDate);
    if (params.specificMonth) queryParams.append('specificMonth', params.specificMonth);

    const response = await api.get(`/reports/income?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al generar el reporte de ingresos');
  }
};

export const getDashboardOverviewRequest = async (): Promise<any> => {
  try {
    const response = await api.get('/reports/dashboard');
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al obtener la vista general del dashboard');
  }
};

// ===================================
// #region DETAILED REPORTS
// ===================================

export const getDetailedClientsReportRequest = async (params: {
  month?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append('month', params.month);
    
    const response = await api.get(`/reports/clients/detailed?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al obtener el reporte detallado de clientes');
  }
};

export const getDetailedPaymentsReportRequest = async (params: {
  month?: string;
  analytics?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append('month', params.month);
    if (params.analytics) queryParams.append('analytics', params.analytics);
    
    const response = await api.get(`/reports/payments/detailed?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error al obtener el reporte detallado de pagos');
  }
};

// #endregion DETAILED REPORTS
