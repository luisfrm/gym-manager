import { getClientsExpiringNextWeek, getNewClientsLastMonth, getTotalClients } from "../services/statistics.services";
import { AppRequest } from "../utils/types";
import Client from "../models/client.model";

class StatisticsController {
  static getClientStatistics = async (_: AppRequest, res: any) => {
    const clients = await Client.find().lean();
    
    const newClientsLastMonth = getNewClientsLastMonth(clients);
    const clientsExpiringNextWeek = getClientsExpiringNextWeek(clients);
    const totalClients = getTotalClients(clients);
    res.status(200).json({ newClientsLastMonth, clientsExpiringNextWeek, totalClients });
  };
}

export default StatisticsController;
