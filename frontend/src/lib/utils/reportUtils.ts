import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { es } from "date-fns/locale";

export const reportTypeLabels: Record<string, string> = {
  daily: "Reporte del día",
  date_specific: "Fecha específica",
  last_7_days: "Últimos 7 días",
  current_week: "Semana actual",
  current_month: "Mes actual",
  month_specific: "Mes específico",
  income_summary: "Resumen de ingresos",
  client_summary: "Resumen de clientes"
};

export const getReportDateRange = (reportType: string, specificDate?: string, specificMonth?: string) => {
  const now = new Date();
  
  switch (reportType) {
    case "daily":
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      };
    
    case "date_specific": {
      if (!specificDate) throw new Error("Fecha específica requerida");
      const targetDate = new Date(specificDate);
      return {
        startDate: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        endDate: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
      };
    }
    
    case "last_7_days":
      return {
        startDate: subDays(now, 7),
        endDate: now
      };
    
    case "current_week":
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Monday as start
        endDate: endOfWeek(now, { weekStartsOn: 1 })
      };
    
    case "current_month":
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
    
    case "month_specific": {
      if (!specificMonth) throw new Error("Mes específico requerido (YYYY-MM)");
      const [year, month] = specificMonth.split("-").map(Number);
      const monthDate = new Date(year, month - 1, 1);
      return {
        startDate: startOfMonth(monthDate),
        endDate: endOfMonth(monthDate)
      };
    }
    
    default:
      throw new Error("Tipo de reporte no válido");
  }
};

export const formatCurrency = (amount: number, currency: "USD" | "VES" | "BS") => {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  } else {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2
    }).format(amount);
  }
};

export const formatDateRange = (startDate: Date, endDate: Date) => {
  return `${format(startDate, "dd/MM/yyyy", { locale: es })} - ${format(endDate, "dd/MM/yyyy", { locale: es })}`;
};

export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: es });
};

export const formatDateTime = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy HH:mm", { locale: es });
};

export const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const generateReportTitle = (reportType: string, dateRange?: { startDate: Date; endDate: Date }, specificDate?: string, specificMonth?: string) => {
  const baseTitle = reportTypeLabels[reportType] || "Reporte";
  
  if (reportType === "daily") {
    return `${baseTitle} - ${formatDate(new Date())}`;
  }
  
  if (reportType === "date_specific" && specificDate) {
    return `${baseTitle} - ${formatDate(new Date(specificDate))}`;
  }
  
  if (reportType === "month_specific" && specificMonth) {
    const [year, month] = specificMonth.split("-");
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${baseTitle} - ${monthNames[parseInt(month) - 1]} ${year}`;
  }
  
  if (dateRange) {
    return `${baseTitle} - ${formatDateRange(dateRange.startDate, dateRange.endDate)}`;
  }
  
  return baseTitle;
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  
  // Function to properly escape CSV values
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    
    const stringValue = String(value);
    
    // If the value contains commas, quotes, or newlines, wrap it in quotes
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n") || stringValue.includes("\r")) {
      // Escape existing quotes by doubling them
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }
    
    return stringValue;
  };
  
  // Build CSV content
  const csvContent = [
    headers.map(escapeCSVValue).join(","),
    ...data.map(row => 
      headers.map(header => escapeCSVValue(row[header])).join(",")
    )
  ].join("\n");
  
  // Add UTF-8 BOM (Byte Order Mark) to ensure proper encoding recognition
  const BOM = "\uFEFF";
  const finalContent = BOM + csvContent;
  
  // Create blob with explicit UTF-8 encoding
  const blob = new Blob([finalContent], { 
    type: "text/csv;charset=utf-8;" 
  });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "text-green-600 bg-green-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "failed":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "paid":
      return "Pagado";
    case "pending":
      return "Pendiente";
    case "failed":
      return "Fallido";
    default:
      return status;
  }
}; 