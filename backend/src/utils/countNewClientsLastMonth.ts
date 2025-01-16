/**
 * Función para calcular cuántos clientes tienen una fecha de vencimiento que expira en los próximos 7 días
 * @param {Array} clients - Arreglo de clientes con una propiedad `fechaVencimiento`
 * @returns {number} - Cantidad de clientes que expiran en los próximos 7 días
 */
import { Client } from "./types";

const countNewClientsLastMonth = (clients: Client[]) => {
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  return clients.filter(client => {
    const clientCreatedAt = new Date(client.createdAt);
    return clientCreatedAt > oneMonthAgo && clientCreatedAt <= currentDate;
  }).length;
}

export default countNewClientsLastMonth;
