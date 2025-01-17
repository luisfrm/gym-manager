import { Request } from "express";
import Payment from "../models/payment.model";

class PaymentController {
  static create = async (req: Request, res: any) => {
    try {
      const { client, amount, date, service, description, paymentMethod, paymentReference, paymentStatus, currency } =
        req.body;

      if (!!paymentReference) {
        const existPaymentReference = await Payment.findOne({ paymentReference });

        if (existPaymentReference) {
          return res.status(400).json({ message: "Payment reference already exists" });
        }
      }

      const payment = new Payment({
        client,
        amount,
        date,
        service,
        description,
        paymentMethod,
        paymentReference,
        paymentStatus,
        currency,
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
