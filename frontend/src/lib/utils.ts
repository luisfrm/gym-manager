import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmailValid = (email = "") => {
  return email !== "" ? emailRegex.test(email) : true;
};

export const isDateActive = (expirationDateStr: string | undefined) => {
  if (!expirationDateStr) return false;
  const expirationDate = new Date(expirationDateStr);
  const currentDate = new Date();
  return expirationDate > currentDate;
};

export const formatDate = (date?: string) => {
  if (!date) return "";
  const dateObj = new Date(date);
  const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
  return utcDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

