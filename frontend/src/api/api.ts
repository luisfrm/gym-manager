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

export const pingServer = async (): Promise<{ status: string }> => {
  const res = await api.get("/ping");
  return res.data;
};

export const loginRequest = async (req: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", req);
  return res.data;
};

export const validateTokenRequest = async (): Promise<ValidateTokenResponse> => {
  const res = await api.get("/auth/validate");
  return res.data;
};

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
  // If there is facial data, send only the encoding (no image)
  if (faceData) {
    const formData = new FormData();
    
    // Add client data
    Object.keys(client).forEach(key => {
      const value = client[key as keyof CreateClientRequest];
      if (value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });
    
    // Add only facial encoding (no image to save storage)
    formData.append('faceEncoding', JSON.stringify(faceData.encoding));
    
    // Make request with FormData (optimized without image)
    const token = useStore.getState().auth.token;
    const apiResponse = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      
      // ✅ SPECIFIC HANDLING FOR DUPLICATE FACE (409)
      if (apiResponse.status === 409) {
        const duplicateError = new Error(errorData.message || 'Esta cara ya está registrada en el sistema');
        (duplicateError as any).existingClient = errorData.existingClient;
        (duplicateError as any).similarity = errorData.similarity;
        (duplicateError as any).isDuplicate = true;
        throw duplicateError;
      }
      
      throw new Error(errorData.message || 'Error al crear cliente');
    }
    
    return apiResponse.json();
  }
  
  // If there is no facial data, use the normal method
  const res = await api.post("/clients", client);
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

export const getClientStatisticsRequest = async (): Promise<ClientStatisticsResponse> => {
  const res = await api.get("/statistics/clients");
  return res.data;
};

export const getClientPaymentsRequest = async (cedula: string): Promise<Payment[]> => {
  const res = await api.get(`/payments/by-client/${cedula}`);
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

export const refreshTokenRequest = async (): Promise<RefreshTokenResponse> => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

export const getPaymentTotalsRequest = async () => {
  const response = await api.get("/payments/totals");
  return response.data;
};

export const registerFace = async (clientId: string, encoding: number[]): Promise<any> => {
  const formData = new FormData();
  
  formData.append('clientId', clientId);
  formData.append('faceEncoding', JSON.stringify(encoding));
  
  // Don't send image to optimize storage - only encoding is needed
  // Convert base64 to blob
  // const response = await fetch(image);
  // const blob = await response.blob();
  // formData.append('faceImage', blob, 'face.jpg');
  
  // Make request with FormData (optimized without image)
  const token = useStore.getState().auth.token;
  const apiResponse = await fetch(`${API_URL}/face/register`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!apiResponse.ok) {
    const errorData = await apiResponse.json();
    
    // Create error with axios structure for compatibility
    const error = new Error(errorData.message || 'Error al registrar cara');
    (error as any).response = {
      status: apiResponse.status,
      data: errorData
    };
    throw error;
  }
  
  return apiResponse.json();
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
  };

  // If there is facial data, send only the encoding (no image)
  if (faceData) {
    const formData = new FormData();
    
    // Add combined data
    Object.keys(combinedData).forEach(key => {
      const value = combinedData[key as keyof typeof combinedData];
      if (value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });
    
    // Add only facial encoding (no image to save storage)
    formData.append('faceEncoding', JSON.stringify(faceData.encoding));
    
    // Make request with FormData (optimized without image)
    const token = useStore.getState().auth.token;
    const apiResponse = await fetch(`${API_URL}/clients/with-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      
      // ✅ SPECIFIC HANDLING FOR DUPLICATE FACE (409)
      if (apiResponse.status === 409) {
        const duplicateError = new Error(errorData.message || 'Esta cara ya está registrada en el sistema');
        (duplicateError as any).existingClient = errorData.existingClient;
        (duplicateError as any).similarity = errorData.similarity;
        (duplicateError as any).isDuplicate = true;
        throw duplicateError;
      }
      
      throw new Error(errorData.message || 'Error al crear cliente con pago');
    }
    
    return apiResponse.json();
  }
  
  // If there is no facial data, use the normal method
  const res = await api.post("/clients/with-payment", combinedData);
  return res.data;
};
