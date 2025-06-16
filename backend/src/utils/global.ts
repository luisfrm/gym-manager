import { LocalDate } from "./LocalDate";

export const formatDateLocal = (date: Date): string => {
  return new LocalDate(date).toISODateString();
};

export const getActiveClients = async (model: any) => {
  const activeClients = await model.distinct("cedula", {
    expiredDate: { $gte: formatDateLocal(new Date()) }
  });
  return activeClients;
};

export const getExpiredClients = async (model: any, date: Date) => {
  const expiredClients = await model.distinct("cedula", {
    expiredDate: { $lt: formatDateLocal(date) }
  });
  return expiredClients;
};