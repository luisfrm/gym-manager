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

  const expiringClients = clients.filter(
    client => new Date(client.expiredDate) >= today && new Date(client.expiredDate) < nextWeek,
  );

  return expiringClients.length;
};

export const getClientsExpiringNext30Days = (clients: Client[]) => {
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const expiringClients = clients.filter(
    client => new Date(client.expiredDate) >= today && new Date(client.expiredDate) < next30Days,
  );

  return expiringClients.length;
};

export const getActiveClients = (clients: Client[]) => {
  const today = new Date();
  const activeClients = clients.filter(client => new Date(client.expiredDate) >= today);
  return activeClients.length;
};

export const getTotalClients = (clients: Client[]) => {
  return clients.length;
};
