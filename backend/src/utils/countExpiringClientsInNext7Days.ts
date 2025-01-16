/**
 * Función para calcular cuántos clientes tienen una fecha de vencimiento que expira en los próximos 7 días
 * @param {Array} clients - Arreglo de clientes con una propiedad `fechaVencimiento`
 * @returns {number} - Cantidad de clientes que expiran en los próximos 7 días
 */
import { Client } from "./types";

const countExpiringClientsInNext7Days = (clients: Client[]) => {
  const currentDate = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(currentDate.getDate() + 7);
  return clients.filter(client => {
    const expirationDate = new Date(client.expiredDate);
    return expirationDate > currentDate && expirationDate <= sevenDaysLater;
  }).length;
}

export default countExpiringClientsInNext7Days;
