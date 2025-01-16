import { Request, Response } from "express";
import Client from "../models/client.model";
import countExpiringClientsInNext7Days from "../utils/countExpiringClientsInNext7Days";
import countNewClientsLastMonth from "../utils/countNewClientsLastMonth";

class ClientController {
  static create = async (req: Request, res: any) => {
    try {
      const { cedula, firstname, lastname, email, phone, address, expiredDate } = req.body;

      const client = new Client({
        cedula: cedula.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        expiredDate: expiredDate.trim(),
      });

      await client.save();

      return res.status(201).json({ client });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating client" });
    }
  }

  static getAll = async (req: Request, res: any) => {
    try {
      const clients = await Client.find().lean();

      const transformedClients = clients.map(client => ({ 
        ...client, 
        _id: client._id.toString()
      }));

      const expiringClients = countExpiringClientsInNext7Days(transformedClients);
      const newClientsLastMonth = countNewClientsLastMonth(transformedClients);

      const total = await Client.countDocuments();

      return res.status(200).json({
        total,
        clients,
        expiringClients,
        newClientsLastMonth,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving clients" });
    }
  }

  static getById = async (req: Request, res: any) => {
    try {
      const { cedula } = req.params;

      console.log(cedula);

      const client = await Client.findOne({ cedula: cedula });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving client" });
    }
  }

  static update = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { firstname, lastname, email, phone, address, expiredDate } = req.body;

      const client = await Client.findByIdAndUpdate(id, {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        expiredDate: expiredDate.trim(),
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json({ message: "Client updated successfully", client });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating client" });
    }
  }

  static delete = async (req: Request, res: any) => {
    try {
      const { id } = req.params;
      await Client.findByIdAndDelete(id);

      return res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting client" });
    }
  }
}

export default ClientController;