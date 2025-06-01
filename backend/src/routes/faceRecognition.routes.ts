import { Router } from "express";
import {
  registerFace,
  verifyFace,
  validateFaceEncoding,
  getClientFaceStatus,
  deleteFaceRegistration,
} from "../controllers/faceRecognition.controller";
import faceRecognitionService from "../services/faceRecognition.service";

const router = Router();

// Configurar multer para subida de imágenes
const upload = faceRecognitionService.getMulterConfig();

// Registrar cara de un cliente
router.post("/register", upload.single("faceImage"), registerFace);

// Verificar cara y obtener cliente
router.post("/verify", verifyFace);

// ✅ NUEVA RUTA: Validar encoding facial sin registrar
router.post("/validate-encoding", validateFaceEncoding);

// Obtener estado facial de un cliente
router.get("/status/:clientId", getClientFaceStatus);

// Eliminar registro facial de un cliente
router.delete("/delete/:clientId", deleteFaceRegistration);

export default router; 