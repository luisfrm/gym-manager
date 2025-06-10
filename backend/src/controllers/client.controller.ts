import Client from "../models/client.model";
import Log from "../models/log.model";
import Payment from "../models/payment.model";
import { AppRequest, ClientPartial } from "../utils/types";
import formatNumber from "../utils/formatNumber";
import safeTrim from "../utils/safeTrim";
import faceRecognitionService from "../services/faceRecognition.service";
import mongoose from "mongoose";

// Función auxiliar para calcular distancia euclidiana
function calculateEuclideanDistance(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) {
    throw new Error("Los vectores deben tener la misma longitud");
  }
  
  let sum = 0;
  for (let i = 0; i < vector1.length; i++) {
    sum += Math.pow(vector1[i] - vector2[i], 2);
  }
  
  return Math.sqrt(sum);
}

class ClientController {
  static create = async (req: AppRequest, res: any) => {
    try {
      const { cedula, firstname, lastname, email, phone, address, expiredDate, faceEncoding } = req.body;

      const clientExists = await Client.findOne({ cedula: cedula });

      if (clientExists) {
        return res.status(400).json({ message: "Client already exists" });
      }

      // Crear datos básicos del cliente
      const clientData: any = {
        cedula: safeTrim(cedula),
        firstname: safeTrim(firstname),
        lastname: safeTrim(lastname),
        email: safeTrim(email),
        phone: safeTrim(phone),
        address: safeTrim(address),
        expiredDate: safeTrim(expiredDate),
      };

      // Procesar datos faciales si están presentes
      if (faceEncoding) {
        try {
          const encoding = Array.isArray(faceEncoding) ? faceEncoding : JSON.parse(faceEncoding);
          
          // ✅ VALIDACIÓN: Verificar si la cara ya está registrada
          const clientsWithFaces = await Client.find({ 
            hasFaceRegistered: true,
            faceEncoding: { $exists: true, $ne: null }
          });

          if (clientsWithFaces.length > 0) {
            const threshold = 0.35; // Mismo umbral que en verificación (65% mínimo)
            
            for (const existingClient of clientsWithFaces) {
              if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
                // Calcular distancia euclidiana
                const distance = calculateEuclideanDistance(encoding, existingClient.faceEncoding);
                
                if (distance < threshold) {
                  // La cara ya está registrada por otro cliente
                  return res.status(409).json({
                    message: "Esta cara ya está registrada en el sistema",
                    existingClient: {
                      id: existingClient._id,
                      firstname: existingClient.firstname,
                      lastname: existingClient.lastname,
                      cedula: existingClient.cedula
                    },
                    similarity: Math.max(0, 1 - distance)
                  });
                }
              }
            }
          }

          // Si llegamos aquí, la cara no está duplicada
          // Only save encoding - no image storage for optimization
          clientData.faceEncoding = encoding;
          clientData.hasFaceRegistered = true;
        } catch (error) {
          console.error("Error processing face data:", error);
        }
      }

      const client = new Client(clientData);
      await client.save();

      const logMessage = `Cliente ${client.firstname} ${client.lastname}, cedula: ${formatNumber(client.cedula)} creado${client.hasFaceRegistered ? ' con registro facial' : ''}.`;
      
      await Log.create({
        message: logMessage,
        user: req.user.userId,
        type: "created",
      });

      return res.status(201).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating client" });
    }
  };

  static getAll = async (req: AppRequest, res: any) => {
    const page = parseInt(req.query.page as string) || 1; // Page number
    const limit = parseInt(req.query.limit as string) || 10; // Quantity of clients to show per page
    const startIndex = (page - 1) * limit; // Start index for pagination. It's used to skip the first n clients
    const search = (req.query.search as string) || ""; // search by cedula, firstname, lastname, email and added i for case insensitive
    const regex = new RegExp(search, "i"); // regex for search
    const sortField = (req.query.sortField as string) || "updatedAt"; // Sort field. If not provided, it will sort by updatedAt
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // Sort order. If not provided, it will sort in ascending order
    try {
      const match = search
        ? {
            $or: [{ cedula: regex }, { firstname: regex }, { lastname: regex }, { email: regex }],
          }
        : {};

      const clients = await Client.aggregate([
        { $match: match },
        { $addFields: { expiredDateObj: { $dateFromString: { dateString: "$expiredDate" } } } },
        { $sort: { [sortField === "expiredDate" ? "expiredDateObj" : sortField]: sortOrder } },
        { $skip: startIndex },
        { $limit: limit },
        { $project: { expiredDateObj: 0 } },
      ]);

      const total = await Client.countDocuments();
      const requestTotal = await Client.countDocuments(match);
      const totalPages = Math.ceil(requestTotal / limit);

      const response = {
        info: {
          total,
          pages: totalPages,
          next:
            page < totalPages
              ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}&limit=${limit}`
              : null,
          prev: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}&limit=${limit}` : null,
        },
        results: clients,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving clients" });
    }
  };

  static getById = async (req: AppRequest, res: any) => {
    try {
      const { cedula } = req.params;

      const client = await Client.findOne({ cedula: cedula });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving client" });
    }
  };

  static update = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { firstname, lastname, email, phone, address, expiredDate, cedula } = req.body;

      const client = await Client.findByIdAndUpdate(id, {
        firstname: safeTrim(firstname),
        lastname: safeTrim(lastname),
        email: safeTrim(email),
        phone: safeTrim(phone),
        address: safeTrim(address),
        expiredDate: safeTrim(expiredDate),
        cedula: safeTrim(cedula),
      });

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await Log.create({
        message: `Cliente ${client.firstname} ${client.lastname}, cedula: ${formatNumber(client.cedula)} actualizado.`,
        user: req.user.userId,
        type: "updated",
      });

      return res.status(200).json({ message: "Client updated successfully", client });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating client" });
    }
  };

  static updatePartial = async (req: AppRequest, res: any) => {
    try {
      const { id } = req.params;

      const updateData: ClientPartial = {};

      const allowedFields = ["cedula", "firstname", "lastname", "email", "phone", "address", "expiredDate"];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      updateData.updatedAt = new Date();

      // const client = await Client.findByIdAndUpdate(
      //   id,
      //   {
      //     $set: updateData,
      //   },
      //   { new: true },
      // );

      // if (!client) {
      //   return res.status(404).json({ message: "Client not found" });
      // }

      // await Log.create({
      //   user: req.user,
      //   message: "Client updated partially",
      //   type: "updated",
      // });

      return res.status(200).json({ message: "Client updated partially", body: req.body });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating client" });
    }
  };

  static delete = async (req: AppRequest, res: any) => {
    try {
      const { id } = req.params;
      const client = await Client.findByIdAndDelete(id);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      await Payment.deleteMany({ client: client._id });

      await Log.create({
        message: `Cliente ${client.firstname} ${client.lastname}, cedula: ${formatNumber(client.cedula)} eliminado.`,
        user: req.user.userId,
        type: "deleted",
      });

      return res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting client" });
    }
  };

  static createWithPayment = async (req: AppRequest, res: any) => {
    // For simplicity and compatibility, always use sequential operations
    // This ensures compatibility with both standalone and replica set MongoDB
    try {
      console.log("Creating client with payment using sequential operations");
      await createClientWithPaymentSequential(req, res);
    } catch (error: any) {
      console.error("Error creating client with payment:", error);
      
      // Handle specific errors
      if (error.message === "Client already exists") {
        return res.status(400).json({ message: "Client already exists" });
      }
      
      if (error.isDuplicate) {
        return res.status(409).json({
          message: "Esta cara ya está registrada en el sistema",
          existingClient: error.existingClient,
          similarity: error.similarity
        });
      }
      
      return res.status(500).json({ message: "Error creating client with payment" });
    }
  };
}

// Helper function for sequential creation (without transactions)
async function createClientWithPaymentSequential(req: AppRequest, res: any) {
  const { 
    // Client data
    cedula, firstname, lastname, email, phone, address, expiredDate, faceEncoding,
    // Payment data
    amount, date, service, paymentMethod, paymentReference, paymentStatus, currency
  } = req.body;

  // Check if client already exists
  const clientExists = await Client.findOne({ cedula: cedula });
  if (clientExists) {
    throw new Error("Client already exists");
  }

  // Create basic client data
  const clientData: any = {
    cedula: safeTrim(cedula),
    firstname: safeTrim(firstname),
    lastname: safeTrim(lastname),
    email: safeTrim(email),
    phone: safeTrim(phone),
    address: safeTrim(address),
    expiredDate: safeTrim(expiredDate),
  };

  // Process facial data if present
  if (faceEncoding) {
    try {
      const encoding = Array.isArray(faceEncoding) ? faceEncoding : JSON.parse(faceEncoding);
      
      // Check if face is already registered
      const clientsWithFaces = await Client.find({ 
        hasFaceRegistered: true,
        faceEncoding: { $exists: true, $ne: null }
      });

      if (clientsWithFaces.length > 0) {
        const threshold = 0.35; // Umbral de similitud (65% mínimo)
        
        for (const existingClient of clientsWithFaces) {
          if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
            const distance = calculateEuclideanDistance(encoding, existingClient.faceEncoding);
            
            if (distance < threshold) {
              const error = new Error("Duplicate face detected") as any;
              error.isDuplicate = true;
              error.existingClient = {
                id: existingClient._id,
                firstname: existingClient.firstname,
                lastname: existingClient.lastname,
                cedula: existingClient.cedula
              };
              error.similarity = Math.max(0, 1 - distance);
              throw error;
            }
          }
        }
      }

      clientData.faceEncoding = encoding;
      clientData.hasFaceRegistered = true;
    } catch (error) {
      console.error("Error processing face data:", error);
      throw error;
    }
  }

  let client: any = null;
  let payment: any = null;

  try {
    // Create client first
    client = new Client(clientData);
    await client.save();

    // Create associated payment
    const paymentData = {
      client: client._id,
      clientCedula: cedula,
      amount: parseFloat(amount),
      date: safeTrim(date),
      service: safeTrim(service),
      paymentMethod: safeTrim(paymentMethod),
      paymentReference: safeTrim(paymentReference),
      paymentStatus: paymentStatus || 'paid',
      currency: currency || 'USD',
      expiredDate: safeTrim(expiredDate)
    };

    payment = new Payment(paymentData);
    await payment.save();

    // Create logs
    const clientLogMessage = `Cliente ${client.firstname} ${client.lastname}, cedula: ${formatNumber(client.cedula)} creado${client.hasFaceRegistered ? ' con registro facial' : ''}.`;
    const paymentLogMessage = `Pago de ${payment.amount} ${payment.currency} registrado para ${client.firstname} ${client.lastname}.`;
    
    await Log.create([
      {
        message: clientLogMessage,
        user: req.user.userId,
        type: "created",
      },
      {
        message: paymentLogMessage,
        user: req.user.userId,
        type: "created",
      }
    ]);

    return res.status(201).json({
      client,
      payment,
      message: "Cliente y pago creados exitosamente"
    });

  } catch (error) {
    // If payment creation fails, try to rollback client creation
    if (client && client._id) {
      try {
        await Client.findByIdAndDelete(client._id);
        console.log("Rolled back client creation due to payment error");
      } catch (rollbackError) {
        console.error("Error rolling back client creation:", rollbackError);
      }
    }
    throw error;
  }
}

// Function to check if MongoDB supports transactions (kept for future use)
async function checkTransactionSupport(): Promise<boolean> {
  try {
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    
    // Check if we're in a replica set or sharded cluster
    const isReplicaSet = serverStatus.repl && serverStatus.repl.setName;
    const isSharded = serverStatus.process === 'mongos';
    
    return isReplicaSet || isSharded;
  } catch (error) {
    console.log("Could not determine transaction support, assuming standalone MongoDB");
    return false;
  }
}

export default ClientController;
