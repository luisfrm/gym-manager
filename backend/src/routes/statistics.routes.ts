import { Router } from "express";
import StatisticsController from "../controllers/statistics.controller";

const router = Router();

router.get("/clients", StatisticsController.getClientStatistics);

export default router;
