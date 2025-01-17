import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateSchema } from "../middleware/validator.middleware";
import { paymentSchema } from "../schemas/payment.schema";

const paymentRouter = Router();

paymentRouter.post("/", authMiddleware(["admin", "employee"]), validateSchema(paymentSchema), PaymentController.create);

paymentRouter.get("/", authMiddleware(["admin", "employee"]), PaymentController.getPayments);

paymentRouter.get(
  "/by-client/:clientCedula",
  authMiddleware(["admin", "employee"]),
  PaymentController.getPaymentByClient,
);

paymentRouter.delete("/:paymentId", authMiddleware(["admin"]), PaymentController.deletePayment);

export default paymentRouter;
