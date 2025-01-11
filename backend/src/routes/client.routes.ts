import { Router } from "express";
import ClientController from "../controllers/client.controller";
import authMiddleware from "../middleware/auth.middleware";

const clientRouter = Router();

clientRouter.post("/", authMiddleware(["admin", "employee"]), ClientController.create);

clientRouter.get("/", authMiddleware(["admin", "employee"]), ClientController.getAll);

clientRouter.get("/test", authMiddleware(["admin"]), ClientController.testFunction);

clientRouter.get("/:id", authMiddleware(["admin", "employee"]), ClientController.getById);

clientRouter.put("/:id", authMiddleware(["admin", "employee"]), ClientController.update);

export default clientRouter;
