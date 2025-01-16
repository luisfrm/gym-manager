import { Router } from "express";
import LogController from "../controllers/log.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware(["admin", "employee"]), LogController.getAll);
router.get("/user", authMiddleware(["admin", "employee"]), LogController.getAllByUser);

export default router;
