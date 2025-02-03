import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import { RoleEnum } from "../config";
import { loginSchema, registerSchema, changePasswordSchema } from "../schemas/auth.schema";
import { validateSchema } from "../middleware/validator.middleware";

const authRouter = Router();

authRouter.post("/register", authMiddleware([RoleEnum.admin]), validateSchema(registerSchema), AuthController.register);

authRouter.post("/login", validateSchema(loginSchema), AuthController.login);

authRouter.get("/validate", AuthController.validateToken);

authRouter.post("/refresh", AuthController.refreshToken);

authRouter.post("/change-password", authMiddleware([RoleEnum.admin, RoleEnum.employee]), validateSchema(changePasswordSchema), AuthController.changePassword);

export default authRouter;
