import { Request, Response } from "express";
import Client from "../models/client.model";
import faceRecognitionService from "../services/faceRecognition.service";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

interface FaceRegistrationBody {
  clientId: string;
  faceEncoding: number[];
}

interface FaceVerificationBody {
  faceEncoding: number[];
}

interface FaceValidationBody {
  faceEncoding: number[];
  excludeClientId?: string;
}

export const registerFace = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { clientId, faceEncoding } = req.body as FaceRegistrationBody;
    
    if (!clientId || !faceEncoding) {
      res.status(400).json({
        message: "ID del cliente y encoding facial son requeridos"
      });
      return;
    }

    // Buscar el cliente
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        message: "Cliente no encontrado"
      });
      return;
    }

    // Convertir encoding a array si viene como string
    const encodingArray = Array.isArray(faceEncoding) ? faceEncoding : JSON.parse(faceEncoding as string);

    // ✅ NUEVA VALIDACIÓN: Verificar si la cara ya está registrada
    const clientsWithFaces = await Client.find({ 
      hasFaceRegistered: true,
      faceEncoding: { $exists: true, $ne: null },
      _id: { $ne: clientId } // Excluir el cliente actual en caso de actualización
    });

    if (clientsWithFaces.length > 0) {
      const threshold = 0.35; // Mismo umbral que en verificación (65% mínimo)
      
      for (const existingClient of clientsWithFaces) {
        if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
          const distance = calculateEuclideanDistance(encodingArray, existingClient.faceEncoding);
          
          if (distance < threshold) {
            // La cara ya está registrada por otro cliente
            res.status(409).json({
              message: "Esta cara ya está registrada en el sistema",
              existingClient: {
                id: existingClient._id,
                firstname: existingClient.firstname,
                lastname: existingClient.lastname,
                cedula: existingClient.cedula
              },
              similarity: Math.max(0, 1 - distance)
            });
            return;
          }
        }
      }
    }

    // Si llegamos aquí, la cara no está duplicada - proceder con el registro

    // Actualizar el cliente con los datos faciales (solo encoding)
    await Client.findByIdAndUpdate(clientId, {
      faceEncoding: encodingArray,
      hasFaceRegistered: true,
    });

    res.status(200).json({
      message: "Registro facial completado exitosamente",
    });
  } catch (error) {
    console.error("Error en registro facial:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const verifyFace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faceEncoding } = req.body as FaceVerificationBody;
    
    if (!faceEncoding || !Array.isArray(faceEncoding)) {
      res.status(400).json({
        message: "Encoding facial válido es requerido"
      });
      return;
    }

    // Buscar todos los clientes con registro facial
    const clientsWithFaces = await Client.find({ 
      hasFaceRegistered: true,
      faceEncoding: { $exists: true, $ne: null }
    });

    if (clientsWithFaces.length === 0) {
      res.status(404).json({
        message: "No hay clientes registrados con reconocimiento facial"
      });
      return;
    }

    // Comparar con cada cliente registrado
    let bestMatch = null;
    let bestDistance = Infinity;
    const threshold = 0.35; // Umbral de similitud (65% mínimo)

    for (const client of clientsWithFaces) {
      if (client.faceEncoding && client.faceEncoding.length > 0) {
        // Calcular distancia euclidiana simple
        const distance = calculateEuclideanDistance(faceEncoding, client.faceEncoding);
        
        if (distance < bestDistance && distance < threshold) {
          bestDistance = distance;
          bestMatch = client;
        }
      }
    }

    if (!bestMatch) {
      res.status(404).json({
        message: "No se encontró coincidencia facial",
        similarity: 0
      });
      return;
    }

    // Verificar si la membresía está vigente
    const currentDate = new Date();
    const expiredDate = new Date(bestMatch.expiredDate);
    const isActive = expiredDate > currentDate;

    res.status(200).json({
      message: "Cliente identificado exitosamente",
      client: {
        id: bestMatch._id,
        firstname: bestMatch.firstname,
        lastname: bestMatch.lastname,
        cedula: bestMatch.cedula,
        expiredDate: bestMatch.expiredDate,
        isActive,
        daysRemaining: isActive ? Math.ceil((expiredDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
      },
      similarity: Math.max(0, 1 - bestDistance), // Convertir distancia a similitud
      isActive
    });

  } catch (error) {
    console.error("Error en verificación facial:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getClientFaceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        message: "Cliente no encontrado"
      });
      return;
    }

    res.status(200).json({
      hasFaceRegistered: client.hasFaceRegistered,
    });
  } catch (error) {
    console.error("Error al obtener estado facial:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const deleteFaceRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        message: "Cliente no encontrado"
      });
      return;
    }


    await Client.findByIdAndUpdate(clientId, {
      faceEncoding: null,
      hasFaceRegistered: false,
    });

    res.status(200).json({
      message: "Registro facial eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar registro facial:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const validateFaceEncoding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faceEncoding, excludeClientId } = req.body as FaceValidationBody;
    
    if (!faceEncoding || !Array.isArray(faceEncoding)) {
      res.status(400).json({
        message: "Encoding facial válido es requerido"
      });
      return;
    }

    // Buscar todos los clientes con registro facial, excluyendo el cliente especificado
    const query: any = { 
      hasFaceRegistered: true,
      faceEncoding: { $exists: true, $ne: null }
    };
    
    if (excludeClientId) {
      query._id = { $ne: excludeClientId };
    }

    const clientsWithFaces = await Client.find(query);

    if (clientsWithFaces.length === 0) {
      // No hay clientes con cara registrada, la validación pasa
      res.status(200).json({
        message: "Cara válida para registro"
      });
      return;
    }

    // Comparar con cada cliente registrado
    const threshold = 0.35; // Mismo umbral que en verificación (65% mínimo)
    
    for (const existingClient of clientsWithFaces) {
      if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
        const distance = calculateEuclideanDistance(faceEncoding, existingClient.faceEncoding);
        
        if (distance < threshold) {
          // La cara ya está registrada por otro cliente
          res.status(409).json({
            message: "Esta cara ya está registrada en el sistema",
            existingClient: {
              id: existingClient._id,
              firstname: existingClient.firstname,
              lastname: existingClient.lastname,
              cedula: existingClient.cedula
            },
            similarity: Math.max(0, 1 - distance)
          });
          return;
        }
      }
    }

    // Si llegamos aquí, la cara no está duplicada
    res.status(200).json({
      message: "Cara válida para registro"
    });

  } catch (error) {
    console.error("Error en validación facial:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

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