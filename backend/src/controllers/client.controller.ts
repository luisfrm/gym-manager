import { Request, Response } from "express";
import Client from "../models/client.model";
import getToken from "../utils/getToken";

class ClientController {
  static create = async (req: Request, res: any) => {
    try {
      const { firstName, lastName, email, phone, address } = req.body;

      const client = new Client({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      await client.save();

      return res.status(201).json({ message: "Client created successfully", client });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating client" });
    }
  }

  static getAll = async (req: Request, res: any) => {
    try {
      const clients = await Client.find();

      return res.status(200).json(clients);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving clients" });
    }
  }

  static getById = async (req: Request, res: any) => {
    try {
      const { id } = req.params;

      const client = await Client.findById(id);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json({ message: "Client retrieved successfully", client });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving client" });
    }
  }

  static testFunction = async (req: Request, res: any) => {
    try {
      const token = getToken(req);

      console.log(token);

      return res.status(200).json({ message: "Test function executed successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error executing test function" });
    }
  }

  static update = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, address } = req.body;

      const client = await Client.findByIdAndUpdate(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
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
}

export default ClientController;