import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===================================
// #region VALIDATION UTILITIES
// ===================================

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmailValid = (email = "") => {
  return email !== "" ? emailRegex.test(email) : true;
};

export const isDateActive = (expirationDateStr: string | undefined) => {
  if (!expirationDateStr) return false;
  
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  return expirationDateStr >= todayStr;
};

export const validatePassword = (password: string) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
    }
  };
};

export const validateUsername = (username: string) => {
  const minLength = 2;
  const maxLength = 50;
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  
  return {
    isValid: username.length >= minLength && 
             username.length <= maxLength && 
             validPattern.test(username),
    requirements: {
      minLength: username.length >= minLength,
      maxLength: username.length <= maxLength,
      validCharacters: validPattern.test(username),
    }
  };
};

// #endregion VALIDATION UTILITIES

// ===================================
// #region DATE UTILITIES
// ===================================

export const formatDate = (date?: string) => {
  if (!date) return "";
  const dateObj = new Date(date);
  const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace unos segundos';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(dateString);
};

export const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  
  return formatDate(dateString);
};

// #endregion DATE UTILITIES

// ===================================
// #region FILE UTILITIES
// ===================================

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateTimestamp = () => {
  return new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
};

// #endregion FILE UTILITIES

// ===================================
// #region STRING UTILITIES
// ===================================

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateUsername = (firstName: string, lastName: string) => {
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
  return `${cleanFirst}.${cleanLast}`;
};

export const formatUserRole = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: 'Administrador',
    employee: 'Empleado',
  };
  return roleMap[role] || capitalizeFirstLetter(role);
};

// #endregion STRING UTILITIES

// ===================================
// #region FORM UTILITIES
// ===================================

export const getFormErrors = (error: any) => {
  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }
  if (error?.response?.data?.message) {
    return { general: error.response.data.message };
  }
  return { general: error.message || 'Error desconocido' };
};

export const clearFormErrors = () => ({});

export const hasFormErrors = (errors: Record<string, any>) => {
  return Object.keys(errors).length > 0;
};

// #endregion FORM UTILITIES

// ===================================
// #region TOAST UTILITIES
// ===================================

export const showSuccessToast = (message: string) => {
  // This would integrate with your toast library
  console.log(`✅ Success: ${message}`);
};

export const showErrorToast = (message: string) => {
  // This would integrate with your toast library  
  console.log(`❌ Error: ${message}`);
};

export const showInfoToast = (message: string) => {
  // This would integrate with your toast library
  console.log(`ℹ️ Info: ${message}`);
};

// #endregion TOAST UTILITIES
