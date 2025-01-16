import { Router } from "express";
import ClientController from "../controllers/client.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateSchema } from "../middleware/validator.middleware";
import { clientSchema } from "../schemas/client.schema";

const clientRouter = Router();

clientRouter.post("/", authMiddleware(["admin", "employee"]), validateSchema(clientSchema), ClientController.create);

clientRouter.get("/", authMiddleware(["admin", "employee"]), ClientController.getAll);

clientRouter.get("/:cedula", authMiddleware(["admin", "employee"]), ClientController.getById);

clientRouter.put("/:id", authMiddleware(["admin", "employee"]), validateSchema(clientSchema), ClientController.update);

clientRouter.delete("/:id", authMiddleware(["admin", "employee"]), ClientController.delete);

export default clientRouter;
