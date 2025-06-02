import { Router } from "express";
import ProfileController from "../controllers/profile.controller";
import authMiddleware from "../middleware/auth.middleware";
import { RoleEnum } from "../config";
import { updateProfileSchema, changePasswordProfileSchema } from "../schemas/profile.schema";
import { validateSchema } from "../middleware/validator.middleware";

const profileRouter = Router();

// All profile routes require authentication
profileRouter.use(authMiddleware([RoleEnum.admin, RoleEnum.employee]));

// Get current user profile
profileRouter.get("/", ProfileController.getProfile);

// Update user profile
profileRouter.put("/", validateSchema(updateProfileSchema), ProfileController.updateProfile);

// Change password
profileRouter.put("/password", validateSchema(changePasswordProfileSchema), ProfileController.changePassword);

export default profileRouter; 