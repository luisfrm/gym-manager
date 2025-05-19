import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateSchema } from "../middleware/validator.middleware";
import { paymentPartialSchema, paymentSchema } from "../schemas/payment.schema";
import { RoleEnum } from "../config";

const paymentRouter = Router();

paymentRouter.post(
  "/",
  authMiddleware([RoleEnum.admin, RoleEnum.employee]),
  validateSchema(paymentSchema),
  PaymentController.create,
);

paymentRouter.get("/", authMiddleware([RoleEnum.admin, RoleEnum.employee]), PaymentController.getPayments);

paymentRouter.get(
  "/by-client/:clientCedula",
  authMiddleware([RoleEnum.admin, RoleEnum.employee]),
  PaymentController.getPaymentByClient,
);

paymentRouter.patch(
  "/:paymentId",
  authMiddleware([RoleEnum.admin]),
  validateSchema(paymentPartialSchema),
  PaymentController.updatePartial,
);

paymentRouter.patch(
  "/paymentStatus/:paymentId",
  authMiddleware([RoleEnum.admin, RoleEnum.employee]),
  validateSchema(paymentPartialSchema),
  PaymentController.updatePaymentStatus,
);

paymentRouter.delete("/:paymentId", authMiddleware(["admin"]), PaymentController.deletePayment);

paymentRouter.get("/totals", PaymentController.getPaymentTotals);

export default paymentRouter;
