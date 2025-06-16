import Payment from "../models/payment.model";
import Client from "../models/client.model";
import Log from "../models/log.model";
import { AppRequest } from "../utils/types";
import { Request, Response } from "express";
import { paymentPartialSchema } from "../schemas/payment.schema";
import { ZodError } from "zod";
import { LocalDate } from "../utils/LocalDate";

// Helper function for backward compatibility
const formatDateLocal = (date: Date): string => {
  return new LocalDate(date).toISODateString();
};

interface PaymentTotal {
  current: {
    USD: number;
    VES: number;
  };
  change: number;
}

class PaymentController {
  static create = async (req: AppRequest, res: any) => {
    try {
      const {
        client,
        clientCedula,
        amount,
        date,
        service,
        description,
        paymentMethod,
        paymentReference,
        paymentStatus,
        currency,
        expiredDate,
      } = req.body;

      if (!!paymentReference) {
        const existPaymentReference = await Payment.findOne({ paymentReference });

        if (existPaymentReference) {
          return res.status(400).json({
            message: "Validation error",
            errors: [
              {
                field: "paymentReference",
                message: "Referencia de pago ya existe"
              }
            ]
          });
        }
      }

      const payment = new Payment({
        client,
        clientCedula,
        amount,
        date,
        service,
        description,
        paymentMethod,
        paymentReference,
        paymentStatus,
        currency,
      });

      const clientFound = await Client.findOne({ cedula: clientCedula });

      if (!clientFound) {
        return res.status(404).json({ message: "Client not found" });
      }

      clientFound.expiredDate = expiredDate;
      await clientFound.save();

      await payment.save();

      await Log.create({
        message: `Pago de ${clientCedula} creado.`,
        user: req.user.userId,
        type: "created",
      });

      return res.status(201).json({ message: "Payment created successfully", payment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating payment" });
    }
  };

  static getPayments = async (req: AppRequest, res: any) => {
    const page = parseInt(req.query.page as string) || 1; // Page number
    const limit = parseInt(req.query.limit as string) || 10; // Quantity of payments to show per page
    const startIndex = (page - 1) * limit; // Start index for pagination. It's used to skip the first n payments
    const search = (req.query.search as string) || ""; // Search parameter
    const regex = new RegExp(search, "i"); // search by client, amount, date, service, paymentMethod, paymentReference, paymentStatus, currency and added i for case insensitive
    const sortField = (req.query.sortField as string) || "updatedAt"; // Sort field. If not provided, it will sort by updatedAt
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // Sort order. If not provided, it will sort in ascending order
    try {
      const match = search
        ? {
            $or: [
              { clientCedula: regex },
              { date: regex },
              { service: regex },
              { paymentMethod: regex },
              { paymentReference: regex },
              { paymentStatus: regex },
              { currency: regex },
            ],
          }
        : {};

      const payments = await Payment.aggregate([
        { $match: match },
        { $addFields: { dateObj: { $dateFromString: { dateString: "$date" } } } },
        { $sort: { [sortField === "date" ? "dateObj" : sortField]: sortOrder } },
        { $skip: startIndex },
        { $limit: limit },
        { $project: { dateObj: 0 } },
      ]);

      await Payment.populate(payments, { path: "client", select: "firstname lastname cedula expiredDate" });

      const total = await Payment.countDocuments();
      const requestTotal = await Payment.countDocuments(match);
      const totalPages = Math.ceil(requestTotal / limit);

      const response = {
        info: {
          total,
          pages: totalPages,
          next:
            page < totalPages
              ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}&limit=${limit}`
              : null,
          prev: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}&limit=${limit}` : null,
        },
        results: payments,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error getting payments" });
    }
  };

  static getPaymentByClient = async (req: AppRequest, res: any) => {
    const clientCedula = req.params.clientCedula;
    const payments = await Payment.find({ clientCedula }).sort({ updatedAt: -1 });

    if (!payments) {
      return res.status(404).json({ message: "No payments found" });
    }

    return res.status(200).json(payments);
  };

  static deletePayment = async (req: AppRequest, res: any) => {
    const paymentId = req.params.paymentId;
    const deletedPayment = await Payment.findByIdAndDelete(paymentId);
    await Log.create({
      message: `Pago de ${deletedPayment?.client} eliminado.`,
      user: req.user.userId,
      type: "deleted",
    });
    return res.status(200).json({ message: "Payment deleted successfully" });
  };

  static updatePartial = async (req: AppRequest, res: any) => {
    try {
      try {
        paymentPartialSchema.parse(req.body);
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({
            message: "Validation error",
            errors: err.errors.map(e => ({
              field: e.path.join("."),
              message: e.message,
            })),
          });
        }
        throw err;
      }

      const { paymentId } = req.params;
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        { $set: req.body },
        { new: true },
      );

      if (!payment) {
        return res.status(404).json({ message: "Client not found" });
      }

      await Log.create({
        user: req.user.userId,
        message: `Pago de ${payment.clientCedula} actualizado.`,
        type: "updated",
      });

      return res.status(200).json({ message: "Payment updated partially", payment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating client" });
    }
  };

  static updatePaymentStatus = async (req: AppRequest, res: any) => {
    try {
      const { paymentId } = req.params;

      const { paymentStatus } = req.body;

      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          $set: { paymentStatus },
        },
        { new: true },
      );

      if (!payment) {
        return res.status(404).json({ message: "Client not found" });
      }

      await Log.create({
        user: req.user.userId,
        message: `Pago de ${payment.clientCedula} actualizado.`,
        type: "updated",
      });

      return res.status(200).json({ message: "Payment updated partially", body: req.body });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating client" });
    }
  };

  static getPaymentTotals = async (req: Request, res: Response) => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      const today = formatDateLocal(currentDate);

      // Get current month totals
      const currentMonthPayments = await Payment.find({
        date: {
          $gte: formatDateLocal(firstDayOfMonth),
          $lte: formatDateLocal(lastDayOfMonth)
        },
        paymentStatus: "paid"
      });

      // Get last month totals
      const lastMonthPayments = await Payment.find({
        date: {
          $gte: formatDateLocal(firstDayOfLastMonth),
          $lte: formatDateLocal(lastDayOfLastMonth)
        },
        paymentStatus: "paid"
      });

      // Get today's payments
      const todayPayments = await Payment.find({
        date: today,
        paymentStatus: "paid"
      });

      // Get total payments count
      const totalPayments = await Payment.countDocuments();

      // Calculate current month totals
      const currentMonthUSD = currentMonthPayments
        .filter(p => p.currency === 'USD')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const currentMonthVES = currentMonthPayments
        .filter(p => p.currency === 'VES')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Calculate last month totals
      const lastMonthUSD = lastMonthPayments
        .filter(p => p.currency === 'USD')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const lastMonthVES = lastMonthPayments
        .filter(p => p.currency === 'VES')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Calculate percentage change for each currency
      const usdChange = lastMonthUSD === 0 
        ? (currentMonthUSD > 0 ? 100 : 0)
        : ((currentMonthUSD - lastMonthUSD) / lastMonthUSD) * 100;

      const vesChange = lastMonthVES === 0 
        ? (currentMonthVES > 0 ? 100 : 0)
        : ((currentMonthVES - lastMonthVES) / lastMonthVES) * 100;

      // Calculate weighted average change based on total amounts
      const totalCurrent = currentMonthUSD + currentMonthVES;
      const totalLast = lastMonthUSD + lastMonthVES;
      
      const weightedChange = totalLast === 0
        ? (totalCurrent > 0 ? 100 : 0)
        : ((totalCurrent - totalLast) / totalLast) * 100;

      const currentMonthTotal: PaymentTotal = {
        current: {
          USD: currentMonthUSD,
          VES: currentMonthVES
        },
        change: Number(weightedChange.toFixed(2))
      };

      const todayTotal = {
        current: {
          USD: todayPayments
            .filter(p => p.currency === 'USD')
            .reduce((sum, p) => sum + Number(p.amount), 0),
          VES: todayPayments
            .filter(p => p.currency === 'VES')
            .reduce((sum, p) => sum + Number(p.amount), 0)
        }
      };

      res.json({
        currentMonthTotal,
        todayTotal,
        totalPayments,
        currentMonthPaymentsCount: currentMonthPayments.length,
        todayPaymentsCount: todayPayments.length
      });
    } catch (error) {
      console.error('Error getting payment totals:', error);
      res.status(500).json({ message: 'Error getting payment totals' });
    }
  };
}

export default PaymentController;
