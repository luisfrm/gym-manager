import { Request, Response } from "express";
import Payment from "../models/payment.model";
import Client from "../models/client.model";
import mongoose from "mongoose";
import { LocalDate } from "../utils/LocalDate";
import { getActiveClients } from "../utils/global";

// Temporary helper for backward compatibility
const formatDateLocal = (date: Date): string => {
  return new LocalDate(date).toISODateString();
};

// Utility function to get date ranges
const getDateRanges = (reportType: string, specificDate?: string, specificMonth?: string) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (reportType) {
    case "daily":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    
    case "date_specific":
      if (!specificDate) throw new Error("Fecha específica requerida");
      const targetDate = new Date(specificDate);
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      break;
    
    case "last_7_days":
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    
    case "current_week":
      const dayOfWeek = now.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    
    case "current_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      break;
    
    case "month_specific":
      if (!specificMonth) throw new Error("Mes específico requerido (YYYY-MM)");
      const [year, month] = specificMonth.split("-").map(Number);
      startDate = new Date(year, month - 1, 1); // Month - 1 because months are 0-indexed
      endDate = new Date(year, month, 0); // Last day of the specified month
      break;
    
    default:
      throw new Error("Tipo de reporte no válido");
  }

  return { startDate, endDate };
};

// Get payments report
export const getPaymentsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      reportType, 
      specificDate, 
      specificMonth, 
      currency = "ALL" 
    } = req.query as {
      reportType: string;
      specificDate?: string;
      specificMonth?: string;
      currency?: string;
    };

    if (!reportType) {
      res.status(400).json({ message: "Tipo de reporte requerido" });
      return;
    }

    const { startDate, endDate } = getDateRanges(reportType, specificDate, specificMonth);

    console.log(startDate, endDate);

    // Build query filter
    const filter: any = {
      date: {
        $gte: new LocalDate(startDate).toISODateString(),
        $lte: new LocalDate(endDate).toISODateString()
      }
    };

    if (currency && currency !== "ALL") {
      filter.currency = currency;
    }

    // Get payments data
    const payments = await Payment.find(filter)
      .populate('client', 'firstname lastname cedula')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      totalPayments: payments.length,
      totalAmountUSD: 0,
      totalAmountVES: 0,
      paidPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      paymentMethods: {},
      services: {},
      dailyBreakdown: {},
    };

    payments.forEach(payment => {
      // Amount by currency
      if (payment.currency === "USD") {
        stats.totalAmountUSD += payment.amount;
      } else if (payment.currency === "VES") {
        stats.totalAmountVES += payment.amount;
      }

      // Payment status
      if (payment.paymentStatus === "paid") stats.paidPayments++;
      else if (payment.paymentStatus === "pending") stats.pendingPayments++;
      else if (payment.paymentStatus === "failed") stats.failedPayments++;

      // Payment methods
      const method = payment.paymentMethod;
      stats.paymentMethods[method] = (stats.paymentMethods[method] || 0) + 1;

      // Services
      const service = payment.service;
      stats.services[service] = (stats.services[service] || 0) + 1;

      // Daily breakdown
      const dayKey = payment.date;
      if (!stats.dailyBreakdown[dayKey]) {
        stats.dailyBreakdown[dayKey] = {
          count: 0,
          amountUSD: 0,
          amountVES: 0
        };
      }
      stats.dailyBreakdown[dayKey].count++;
      if (payment.currency === "USD") {
        stats.dailyBreakdown[dayKey].amountUSD += payment.amount;
      } else {
        stats.dailyBreakdown[dayKey].amountVES += payment.amount;
      }
    });

    res.json({
      reportType,
      dateRange: { startDate, endDate },
      currency,
      stats,
      payments: payments.map(payment => ({
        _id: payment._id,
        client: payment.client,
        clientCedula: payment.clientCedula,
        amount: payment.amount,
        currency: payment.currency,
        date: payment.date,
        service: payment.service,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference,
        paymentStatus: payment.paymentStatus,
        createdAt: payment.createdAt
      }))
    });

  } catch (error: any) {
    console.error("Error generating payments report:", error);
    res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
};

// Get clients report
export const getClientsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      reportType, 
      specificDate, 
      specificMonth 
    } = req.query as {
      reportType: string;
      specificDate?: string;
      specificMonth?: string;
    };

    if (!reportType) {
      res.status(400).json({ message: "Tipo de reporte requerido" });
      return;
    }

    const { startDate, endDate } = getDateRanges(reportType, specificDate, specificMonth);

    // Get clients created in the date range
    const newClients = await Client.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ createdAt: -1 });

    // Get all clients and their payment history
    const allClients = await Client.find();
    
    // Get payments for all clients in the date range
    const payments = await Payment.find({
      date: {
        $gte: new LocalDate(startDate).toISODateString(),
        $lte: new LocalDate(endDate).toISODateString()
      }
    }).populate('client', 'firstname lastname cedula');

    // Calculate client statistics
    const stats = {
      totalClients: allClients.length,
      newClientsInPeriod: newClients.length,
      clientsWithPayments: new Set(payments.map(p => p.clientCedula)).size,
      clientsWithFaceRecognition: allClients.filter(c => c.hasFaceRegistered).length,
      activeClients: 0,
      expiredClients: 0,
      clientsByMonth: {},
    };

    // Calculate active and expired clients
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPayments = await Payment.find({
      date: { $gte: new LocalDate(thirtyDaysAgo).toISODateString() }
    });
    stats.activeClients = new Set(recentPayments.map(p => p.clientCedula)).size;

    allClients.forEach(client => {
      if (client.expiredDate) {
        const expiredDate = new Date(client.expiredDate);
        if (expiredDate < new Date()) {
          stats.expiredClients++;
        }
      }

      // Clients by month (registration)
      const monthKey = client.createdAt.toISOString().slice(0, 7); // YYYY-MM
      stats.clientsByMonth[monthKey] = (stats.clientsByMonth[monthKey] || 0) + 1;
    });

    // Client payment summary
    const clientPaymentSummary = [];
    for (const client of allClients) {
      const clientPayments = await Payment.find({
        clientCedula: client.cedula,
        date: {
          $gte: formatDateLocal(startDate),
          $lte: formatDateLocal(endDate)
        }
      });

      if (clientPayments.length > 0) {
        const totalUSD = clientPayments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0);
        const totalVES = clientPayments.filter(p => p.currency === "VES").reduce((sum, p) => sum + p.amount, 0);

        clientPaymentSummary.push({
          client: {
            _id: client._id,
            firstname: client.firstname,
            lastname: client.lastname,
            cedula: client.cedula,
            email: client.email,
            phone: client.phone,
            expiredDate: client.expiredDate,
            hasFaceRegistered: client.hasFaceRegistered
          },
          paymentCount: clientPayments.length,
          totalAmountUSD: totalUSD,
          totalAmountVES: totalVES,
          lastPayment: clientPayments[clientPayments.length - 1]?.createdAt
        });
      }
    }

    res.json({
      reportType,
      dateRange: { startDate, endDate },
      stats,
      newClients: newClients.map(client => ({
        _id: client._id,
        firstname: client.firstname,
        lastname: client.lastname,
        cedula: client.cedula,
        email: client.email,
        phone: client.phone,
        address: client.address,
        expiredDate: client.expiredDate,
        hasFaceRegistered: client.hasFaceRegistered,
        createdAt: client.createdAt
      })),
      clientPaymentSummary
    });

  } catch (error: any) {
    console.error("Error generating clients report:", error);
    res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
};

// Get income summary report
export const getIncomeSummaryReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      reportType, 
      specificDate, 
      specificMonth 
    } = req.query as {
      reportType: string;
      specificDate?: string;
      specificMonth?: string;
    };

    if (!reportType) {
      res.status(400).json({ message: "Tipo de reporte requerido" });
      return;
    }

    const { startDate, endDate } = getDateRanges(reportType, specificDate, specificMonth);

    // Get all payments in the date range
    const payments = await Payment.find({
      date: {
        $gte: formatDateLocal(startDate),
        $lte: formatDateLocal(endDate)
      }
    });

    // Calculate income by currency and payment method
    const incomeByMethod = {};
    const incomeByService = {};
    const dailyIncome = {};
    
    let totalIncomeUSD = 0;
    let totalIncomeVES = 0;

    payments.forEach(payment => {
      // Total income
      if (payment.currency === "USD") {
        totalIncomeUSD += payment.amount;
      } else if (payment.currency === "VES") {
        totalIncomeVES += payment.amount;
      }

      // Income by payment method
      const methodKey = `${payment.paymentMethod}_${payment.currency}`;
      if (!incomeByMethod[methodKey]) {
        incomeByMethod[methodKey] = {
          method: payment.paymentMethod,
          currency: payment.currency,
          amount: 0,
          count: 0
        };
      }
      incomeByMethod[methodKey].amount += payment.amount;
      incomeByMethod[methodKey].count++;

      // Income by service
      const serviceKey = `${payment.service}_${payment.currency}`;
      if (!incomeByService[serviceKey]) {
        incomeByService[serviceKey] = {
          service: payment.service,
          currency: payment.currency,
          amount: 0,
          count: 0
        };
      }
      incomeByService[serviceKey].amount += payment.amount;
      incomeByService[serviceKey].count++;

      // Daily income
      const dayKey = payment.date;
      if (!dailyIncome[dayKey]) {
        dailyIncome[dayKey] = {
          date: dayKey,
          amountUSD: 0,
          amountVES: 0,
          count: 0
        };
      }
      if (payment.currency === "USD") {
        dailyIncome[dayKey].amountUSD += payment.amount;
      } else {
        dailyIncome[dayKey].amountVES += payment.amount;
      }
      dailyIncome[dayKey].count++;
    });

    res.json({
      reportType,
      dateRange: { startDate, endDate },
      summary: {
        totalIncomeUSD,
        totalIncomeVES,
        totalTransactions: payments.length,
        averageTransactionUSD: payments.filter(p => p.currency === "USD").length > 0 
          ? totalIncomeUSD / payments.filter(p => p.currency === "USD").length 
          : 0,
        averageTransactionVES: payments.filter(p => p.currency === "VES").length > 0 
          ? totalIncomeVES / payments.filter(p => p.currency === "VES").length 
          : 0
      },
      incomeByMethod: Object.values(incomeByMethod),
      incomeByService: Object.values(incomeByService),
      dailyIncome: Object.values(dailyIncome).sort((a: any, b: any) => a.date.localeCompare(b.date))
    });

  } catch (error: any) {
    console.error("Error generating income summary report:", error);
    res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
};

// Get dashboard overview (quick stats)
export const getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's stats
    const todayPayments = await Payment.find({
      date: formatDateLocal(startOfToday)
    });

    // Month stats
    const monthPayments = await Payment.find({
      date: {
        $gte: formatDateLocal(startOfMonth),
        $lte: formatDateLocal(now)
      }
    });

    // Client stats
    const totalClients = await Client.countDocuments();
    const newClientsThisMonth = await Client.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const activeClients = await getActiveClients(Client);

    // Calculate totals
    const todayIncomeUSD = todayPayments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0);
    const todayIncomeVES = todayPayments.filter(p => p.currency === "VES").reduce((sum, p) => sum + p.amount, 0);
    
    const monthIncomeUSD = monthPayments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0);
    const monthIncomeVES = monthPayments.filter(p => p.currency === "VES").reduce((sum, p) => sum + p.amount, 0);

    res.json({
      today: {
        incomeUSD: todayIncomeUSD,
        incomeVES: todayIncomeVES,
        transactionCount: todayPayments.length
      },
      month: {
        incomeUSD: monthIncomeUSD,
        incomeVES: monthIncomeVES,
        transactionCount: monthPayments.length,
        newClients: newClientsThisMonth
      },
      clients: {
        total: totalClients,
        active: activeClients.length,
        newThisMonth: newClientsThisMonth
      }
    });

  } catch (error: any) {
    console.error("Error generating dashboard overview:", error);
    res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
};

// Specific Clients Report with detailed client status information
export const getSpecificClientsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month } = req.query as { month?: string };
    
    const now = new Date();
    let targetMonth: Date;
    let nextMonth: Date;
    
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      targetMonth = new Date(year, monthNum - 1, 1);
      nextMonth = new Date(year, monthNum, 1);
    } else {
      targetMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get all clients
    const allClients = await Client.find().sort({ createdAt: -1 });
    
    // Clients currently expired (expired date is in the past)
    const expiredClients = allClients.filter(client => {
      if (!client.expiredDate) return false;
      return new Date(client.expiredDate) < now;
    });

    // Clients currently active (expired date is in the future or null, and had payments in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const activeClients = await getActiveClients(Client);

    // Clients who renewed in the target month (had payments)
    const renewalPayments = await Payment.find({
      date: {
        $gte: targetMonth.toISOString().split('T')[0],
        $lt: nextMonth.toISOString().split('T')[0]
      }
    }).populate('client', 'firstname lastname cedula email phone expiredDate');

    const renewedClientsMap = new Map();
    renewalPayments.forEach(payment => {
      const cedula = payment.clientCedula;
      if (!renewedClientsMap.has(cedula)) {
        renewedClientsMap.set(cedula, {
          client: payment.client || allClients.find(c => c.cedula === cedula),
          paymentsCount: 0,
          totalAmountUSD: 0,
          totalAmountVES: 0,
          lastPaymentDate: payment.date
        });
      }
      const clientData = renewedClientsMap.get(cedula);
      clientData.paymentsCount++;
      if (payment.currency === "USD") {
        clientData.totalAmountUSD += payment.amount;
      } else {
        clientData.totalAmountVES += payment.amount;
      }
      if (payment.date > clientData.lastPaymentDate) {
        clientData.lastPaymentDate = payment.date;
      }
    });

    // Clients who registered in the target month
    const newClients = allClients.filter(client => {
      const createdAt = new Date(client.createdAt);
      return createdAt >= targetMonth && createdAt < nextMonth;
    });

    // Calculate client segments
    const clientSegments = {
      premium: allClients.filter(client => {
        const payments = renewalPayments.filter(p => p.clientCedula === client.cedula);
        const totalUSD = payments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0);
        return totalUSD >= 50; // Premium clients with $50+ payments
      }).length,
      regular: allClients.filter(client => {
        const payments = renewalPayments.filter(p => p.clientCedula === client.cedula);
        const totalUSD = payments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0);
        return totalUSD >= 20 && totalUSD < 50; // Regular clients
      }).length,
      basic: allClients.filter(client => {
        const payments = renewalPayments.filter(p => p.clientCedula === client.cedula);
        const totalUSD = payments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0);
        return totalUSD > 0 && totalUSD < 20; // Basic clients
      }).length
    };

    // Clients at risk (expired in next 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const clientsAtRisk = allClients.filter(client => {
      if (!client.expiredDate) return false;
      const expiredDate = new Date(client.expiredDate);
      return expiredDate > now && expiredDate <= sevenDaysFromNow;
    });

    res.json({
      reportType: "specific_clients",
      month: month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      dateRange: { startDate: targetMonth, endDate: nextMonth },
      summary: {
        totalClients: allClients.length,
        expiredClients: expiredClients.length,
        activeClients: activeClients.length,
        renewedClients: renewedClientsMap.size,
        newClients: newClients.length,
        clientsAtRisk: clientsAtRisk.length,
        clientsWithFace: allClients.filter(c => c.hasFaceRegistered).length,
        ...clientSegments
      },
      expiredClients: expiredClients.map(client => ({
        _id: client._id,
        name: `${client.firstname} ${client.lastname}`,
        cedula: client.cedula,
        email: client.email,
        phone: client.phone,
        expiredDate: client.expiredDate,
        daysExpired: Math.floor((now.getTime() - new Date(client.expiredDate).getTime()) / (1000 * 60 * 60 * 24)),
        hasFaceRegistered: client.hasFaceRegistered
      })),
      activeClients: activeClients.map(client => ({
        _id: client._id,
        name: `${client.firstname} ${client.lastname}`,
        cedula: client.cedula,
        email: client.email,
        phone: client.phone,
        expiredDate: client.expiredDate,
        hasFaceRegistered: client.hasFaceRegistered,
        daysUntilExpiry: client.expiredDate ? Math.floor((new Date(client.expiredDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
      })),
      renewedClients: Array.from(renewedClientsMap.values()),
      newClients: newClients.map(client => ({
        _id: client._id,
        name: `${client.firstname} ${client.lastname}`,
        cedula: client.cedula,
        email: client.email,
        phone: client.phone,
        address: client.address,
        expiredDate: client.expiredDate,
        hasFaceRegistered: client.hasFaceRegistered,
        createdAt: client.createdAt,
        daysAsClient: Math.floor((now.getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      })),
      clientsAtRisk: clientsAtRisk.map(client => ({
        _id: client._id,
        name: `${client.firstname} ${client.lastname}`,
        cedula: client.cedula,
        email: client.email,
        phone: client.phone,
        expiredDate: client.expiredDate,
        daysUntilExpiry: Math.floor((new Date(client.expiredDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        hasFaceRegistered: client.hasFaceRegistered
      }))
    });

  } catch (error: any) {
    console.error("Error generating specific clients report:", error);
    res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
};

// Specific Payments Report with detailed payment analytics
export const getSpecificPaymentsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, analytics = "true" } = req.query as { month?: string; analytics?: string };
    
    const now = new Date();
    let targetMonth: Date;
    let nextMonth: Date;
    
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      targetMonth = new Date(year, monthNum - 1, 1);
      nextMonth = new Date(year, monthNum, 1);
    } else {
      targetMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get payments for the current month
    const monthPayments = await Payment.find({
      date: {
        $gte: targetMonth.toISOString().split('T')[0],
        $lt: nextMonth.toISOString().split('T')[0]
      }
    }).populate('client', 'firstname lastname cedula email').sort({ createdAt: -1 });

    // Categorize payments by status
    const paidPayments = monthPayments.filter(p => p.paymentStatus === "paid");
    const pendingPayments = monthPayments.filter(p => p.paymentStatus === "pending");
    const failedPayments = monthPayments.filter(p => p.paymentStatus === "failed");

    // Payment analytics
    const analytics_data = {
      // Payment trends by day
      dailyTrends: {},
      // Payment method performance
      methodPerformance: {},
      // Service popularity
      serviceAnalytics: {},
      // Currency distribution
      currencyDistribution: {
        USD: { count: 0, amount: 0, percentage: 0 },
        VES: { count: 0, amount: 0, percentage: 0 }
      },
      // Client payment behavior
      clientBehavior: {
        newCustomers: 0,
        returningCustomers: 0,
        averagePaymentValue: { USD: 0, VES: 0 },
        topSpenders: []
      },
      // Time-based analytics
      timeAnalytics: {
        peakDays: {},
        averagePaymentsPerDay: 0,
        successRate: 0,
        responseTime: "2-3 días" // Estimated processing time
      }
    };

    if (analytics === "true") {
      // Daily trends
      monthPayments.forEach(payment => {
        const day = payment.date;
        if (!analytics_data.dailyTrends[day]) {
          analytics_data.dailyTrends[day] = {
            date: day,
            paid: 0,
            pending: 0,
            failed: 0,
            totalAmount: { USD: 0, VES: 0 }
          };
        }
        analytics_data.dailyTrends[day][payment.paymentStatus]++;
        analytics_data.dailyTrends[day].totalAmount[payment.currency] += payment.amount;
      });

      // Payment method performance
      monthPayments.forEach(payment => {
        const method = payment.paymentMethod;
        if (!analytics_data.methodPerformance[method]) {
          analytics_data.methodPerformance[method] = {
            total: 0,
            paid: 0,
            pending: 0,
            failed: 0,
            successRate: 0,
            totalAmount: { USD: 0, VES: 0 }
          };
        }
        const methodData = analytics_data.methodPerformance[method];
        methodData.total++;
        methodData[payment.paymentStatus]++;
        methodData.totalAmount[payment.currency] += payment.amount;
        methodData.successRate = Math.round((methodData.paid / methodData.total) * 100);
      });

      // Service analytics
      monthPayments.forEach(payment => {
        const service = payment.service;
        if (!analytics_data.serviceAnalytics[service]) {
          analytics_data.serviceAnalytics[service] = {
            count: 0,
            revenue: { USD: 0, VES: 0 },
            avgAmount: { USD: 0, VES: 0 },
            successRate: 0,
            paid: 0
          };
        }
        const serviceData = analytics_data.serviceAnalytics[service];
        serviceData.count++;
        serviceData.revenue[payment.currency] += payment.amount;
        if (payment.paymentStatus === "paid") {
          serviceData.paid++;
        }
        serviceData.successRate = Math.round((serviceData.paid / serviceData.count) * 100);
      });

      // Currency distribution
      monthPayments.forEach(payment => {
        analytics_data.currencyDistribution[payment.currency].count++;
        analytics_data.currencyDistribution[payment.currency].amount += payment.amount;
      });
      const totalPayments = monthPayments.length;
      analytics_data.currencyDistribution.USD.percentage = Math.round((analytics_data.currencyDistribution.USD.count / totalPayments) * 100);
      analytics_data.currencyDistribution.VES.percentage = Math.round((analytics_data.currencyDistribution.VES.count / totalPayments) * 100);

      // Client behavior analysis
      const clientPaymentMap = new Map();
      monthPayments.forEach(payment => {
        const cedula = payment.clientCedula;
        if (!clientPaymentMap.has(cedula)) {
          clientPaymentMap.set(cedula, {
            client: payment.client,
            payments: [],
            totalUSD: 0,
            totalVES: 0
          });
        }
        const clientData = clientPaymentMap.get(cedula);
        clientData.payments.push(payment);
        if (payment.currency === "USD") {
          clientData.totalUSD += payment.amount;
        } else {
          clientData.totalVES += payment.amount;
        }
      });

      // Calculate client metrics
      const previousMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
      const previousMonthPayments = await Payment.find({
        date: {
          $gte: previousMonth.toISOString().split('T')[0],
          $lt: targetMonth.toISOString().split('T')[0]
        }
      });
      const previousClientCedulas = new Set(previousMonthPayments.map(p => p.clientCedula));

      analytics_data.clientBehavior.newCustomers = Array.from(clientPaymentMap.keys()).filter(cedula => !previousClientCedulas.has(cedula)).length;
      analytics_data.clientBehavior.returningCustomers = Array.from(clientPaymentMap.keys()).filter(cedula => previousClientCedulas.has(cedula)).length;

      // Average payment values
      const paidUSD = paidPayments.filter(p => p.currency === "USD");
      const paidVES = paidPayments.filter(p => p.currency === "VES");
      analytics_data.clientBehavior.averagePaymentValue.USD = paidUSD.length > 0 ? Math.round(paidUSD.reduce((sum, p) => sum + p.amount, 0) / paidUSD.length * 100) / 100 : 0;
      analytics_data.clientBehavior.averagePaymentValue.VES = paidVES.length > 0 ? Math.round(paidVES.reduce((sum, p) => sum + p.amount, 0) / paidVES.length * 100) / 100 : 0;

      // Top spenders
      analytics_data.clientBehavior.topSpenders = Array.from(clientPaymentMap.values())
        .sort((a, b) => (b.totalUSD + b.totalVES * 0.000025) - (a.totalUSD + a.totalVES * 0.000025)) // Convert VES to USD for comparison
        .slice(0, 10)
        .map(clientData => ({
          client: clientData.client,
          totalUSD: clientData.totalUSD,
          totalVES: clientData.totalVES,
          paymentCount: clientData.payments.length
        }));

      // Time analytics
      const daysInMonth = Math.ceil((nextMonth.getTime() - targetMonth.getTime()) / (1000 * 60 * 60 * 24));
      analytics_data.timeAnalytics.averagePaymentsPerDay = Math.round((monthPayments.length / daysInMonth) * 100) / 100;
      analytics_data.timeAnalytics.successRate = Math.round((paidPayments.length / monthPayments.length) * 100);

      // Peak days analysis
      Object.entries(analytics_data.dailyTrends).forEach(([date, data]: [string, any]) => {
        const dayName = new Date(date).toLocaleDateString('es-ES', { weekday: 'long' });
        if (!analytics_data.timeAnalytics.peakDays[dayName]) {
          analytics_data.timeAnalytics.peakDays[dayName] = 0;
        }
        analytics_data.timeAnalytics.peakDays[dayName] += data.paid + data.pending + data.failed;
      });
    }

    // Recent failed payments analysis
    const recentFailedPayments = failedPayments.slice(0, 20).map(payment => ({
      _id: payment._id,
      client: payment.client,
      amount: payment.amount,
      currency: payment.currency,
      service: payment.service,
      paymentMethod: payment.paymentMethod,
      date: payment.date,
      description: payment.description,
      failureReason: payment.description || "Razón no especificada",
      createdAt: payment.createdAt
    }));

    // High-value transactions
    const highValueTransactions = paidPayments
      .filter(p => (p.currency === "USD" && p.amount >= 30) || (p.currency === "VES" && p.amount >= 1000))
      .map(payment => ({
        _id: payment._id,
        client: payment.client,
        amount: payment.amount,
        currency: payment.currency,
        service: payment.service,
        paymentMethod: payment.paymentMethod,
        date: payment.date,
        createdAt: payment.createdAt
      }));

    res.json({
      reportType: "specific_payments",
      month: month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      dateRange: { startDate: targetMonth, endDate: nextMonth },
      summary: {
        totalPayments: monthPayments.length,
        paidPayments: paidPayments.length,
        pendingPayments: pendingPayments.length,
        failedPayments: failedPayments.length,
        successRate: Math.round((paidPayments.length / monthPayments.length) * 100),
        totalRevenueUSD: paidPayments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0),
        totalRevenueVES: paidPayments.filter(p => p.currency === "VES").reduce((sum, p) => sum + p.amount, 0),
        averageTransactionUSD: paidPayments.filter(p => p.currency === "USD").length > 0 ? 
          Math.round(paidPayments.filter(p => p.currency === "USD").reduce((sum, p) => sum + p.amount, 0) / paidPayments.filter(p => p.currency === "USD").length * 100) / 100 : 0,
        averageTransactionVES: paidPayments.filter(p => p.currency === "VES").length > 0 ? 
          Math.round(paidPayments.filter(p => p.currency === "VES").reduce((sum, p) => sum + p.amount, 0) / paidPayments.filter(p => p.currency === "VES").length * 100) / 100 : 0
      },
      paidPayments: paidPayments.slice(0, 50).map(payment => ({
        _id: payment._id,
        client: payment.client,
        amount: payment.amount,
        currency: payment.currency,
        service: payment.service,
        paymentMethod: payment.paymentMethod,
        date: payment.date,
        createdAt: payment.createdAt
      })),
      pendingPayments: pendingPayments.map(payment => ({
        _id: payment._id,
        client: payment.client,
        amount: payment.amount,
        currency: payment.currency,
        service: payment.service,
        paymentMethod: payment.paymentMethod,
        date: payment.date,
        daysPending: Math.floor((now.getTime() - new Date(payment.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        createdAt: payment.createdAt
      })),
      failedPayments: recentFailedPayments,
      highValueTransactions,
      analytics: analytics === "true" ? analytics_data : null
    });

  } catch (error: any) {
    console.error("Error generating specific payments report:", error);
    res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
}; 