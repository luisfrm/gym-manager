import { Router } from "express";
import { 
  getPaymentsReport, 
  getClientsReport, 
  getIncomeSummaryReport, 
  getDashboardOverview,
  getSpecificClientsReport,
  getSpecificPaymentsReport
} from "../controllers/report.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// Dashboard overview - quick stats
router.get("/dashboard", authMiddleware(["admin", "employee"]), getDashboardOverview);

// General Payments reports
router.get("/payments", authMiddleware(["admin", "employee"]), getPaymentsReport);

// General Clients reports  
router.get("/clients", authMiddleware(["admin", "employee"]), getClientsReport);

// Income summary reports
router.get("/income", authMiddleware(["admin", "employee"]), getIncomeSummaryReport);

// Specific Clients Report - detailed client status analysis
router.get("/clients/detailed", authMiddleware(["admin", "employee"]), getSpecificClientsReport);

// Specific Payments Report - detailed payment analytics
router.get("/payments/detailed", authMiddleware(["admin", "employee"]), getSpecificPaymentsReport);

export default router; 