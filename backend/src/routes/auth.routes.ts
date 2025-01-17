import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/register", authMiddleware(["admin"]), AuthController.register);

authRouter.post("/login", AuthController.login);

authRouter.get("/validate", AuthController.validateToken);

authRouter.post("/refresh", AuthController.refreshToken);

export default authRouter;
