import { Router } from "express";
import ClientController from "../controllers/client.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateSchema } from "../middleware/validator.middleware";
import { clientSchema } from "../schemas/client.schema";
import faceRecognitionService from "../services/faceRecognition.service";

const clientRouter = Router();

clientRouter.post("/", authMiddleware(["admin", "employee"]), faceRecognitionService.upload.single('faceImage'), validateSchema(clientSchema), ClientController.create);

clientRouter.get("/", authMiddleware(["admin", "employee"]), ClientController.getAll);

clientRouter.get("/:cedula", authMiddleware(["admin", "employee"]), ClientController.getById);

clientRouter.put("/:id", authMiddleware(["admin", "employee"]), validateSchema(clientSchema), ClientController.update);

clientRouter.delete("/:id", authMiddleware(["admin"]), ClientController.delete);

export default clientRouter;
