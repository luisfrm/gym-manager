import { getClientsExpiringNextWeek, getNewClientsLastMonth, getTotalClients, getClientsExpiringNext30Days, getActiveClients } from "../services/statistics.services";
import { AppRequest } from "../utils/types";
import Client from "../models/client.model";

class StatisticsController {
  static getClientStatistics = async (_: AppRequest, res: any) => {
    const clients = await Client.find().lean();

    const newClientsLastMonth = getNewClientsLastMonth(clients);
    const clientsExpiringNextWeek = getClientsExpiringNextWeek(clients);
    const clientsExpiringNext30Days = getClientsExpiringNext30Days(clients);
    const activeClients = getActiveClients(clients);
    const totalClients = getTotalClients(clients);
    res.status(200).json({ newClientsLastMonth, clientsExpiringNextWeek, clientsExpiringNext30Days, activeClients, totalClients });
  };
}

export default StatisticsController;
