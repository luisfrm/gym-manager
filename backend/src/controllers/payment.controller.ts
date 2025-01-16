import { Request } from "express";
import Payment from "../models/payment.model";

class PaymentController {
  static create = async (req: Request, res: any) => {
    try {
      const { clientId, amount, date, service, description, paymentMethod, paymentReference, paymentStatus, currency, expiredAt } =
        req.body;

      const payment = new Payment({
        clientId,
        amount,
        date,
        service,
        description,
        paymentMethod,
        paymentReference,
        paymentStatus,
        currency,
        expiredAt,
      });

      await payment.save();

      return res.status(201).json({ message: "Payment created successfully", payment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating payment" });
    }
  };
}

export default PaymentController;
