import { Router } from "express";
import {
  registerFace,
  verifyFace,
  validateFaceEncoding,
  getClientFaceStatus,
  deleteFaceRegistration,
} from "../controllers/faceRecognition.controller";

const router = Router();

router.post("/register", registerFace);

router.post("/verify", verifyFace);

router.post("/validate-encoding", validateFaceEncoding);

router.get("/status/:clientId", getClientFaceStatus);

router.delete("/delete/:clientId", deleteFaceRegistration);

export default router; 