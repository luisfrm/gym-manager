import { Client } from "../utils/types";

export const getNewClientsLastMonth = (clients: Client[]) => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const newClients = clients.filter(client => new Date(client.createdAt) >= lastMonth);

  return newClients.length;
};

export const getClientsExpiringNextWeek = (clients: Client[]) => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const expiringClients = clients.filter(client => new Date(client.expiredDate) >= today && new Date(client.expiredDate) < nextWeek);

  return expiringClients.length;
};

export const getTotalClients = (clients: Client[]) => {
  return clients.length;
};
