import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Download, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getPaymentsReportRequest } from "@/api/api";
import { 
  formatCurrency, 
  formatDate, 
  generateReportTitle, 
  exportToCSV,
  getPaymentStatusColor,
  getPaymentStatusLabel
} from "@/lib/utils/reportUtils";
import type { Payment } from "@/lib/types";

const PaymentsReport = () => {
  const [reportType, setReportType] = useState("current_month");
  const [specificDate, setSpecificDate] = useState<Date>();
  const [specificMonth, setSpecificMonth] = useState("");
  const [currency, setCurrency] = useState("ALL");

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ["payments-report", reportType, specificDate, specificMonth, currency],
    queryFn: () => getPaymentsReportRequest({
      reportType,
      specificDate: specificDate?.toISOString().split('T')[0],
      specificMonth,
      currency
    }),
    enabled: reportType !== "date_specific" || !!specificDate,
  });

  const handleGenerateReport = () => {
    refetch();
  };

  const handleExportCSV = () => {
    if (!reportData?.payments?.length) return;
    
    const exportData = reportData.payments.map((payment: Payment) => ({
      'Fecha': formatDate(payment.createdAt || new Date()),
      'Cliente': `${payment.client?.firstname} ${payment.client?.lastname}`,
      'Cédula': payment.clientCedula,
      'Monto': payment.amount,
      'Moneda': payment.currency,
      'Servicio': payment.service,
      'Método de pago': payment.paymentMethod,
      'Estado': getPaymentStatusLabel(payment.paymentStatus),
      'Referencia': payment.paymentReference || '',
      'Descripción': payment.description || ''
    }));
    
    const title = generateReportTitle(reportType, reportData.dateRange, specificDate?.toISOString().split('T')[0], specificMonth);
    exportToCSV(exportData, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Configuración del Reporte</span>
          </CardTitle>
          <CardDescription>
            Selecciona los parámetros para generar el reporte de pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Reporte del día</SelectItem>
                  <SelectItem value="date_specific">Fecha específica</SelectItem>
                  <SelectItem value="last_7_days">Últimos 7 días</SelectItem>
                  <SelectItem value="current_week">Semana actual</SelectItem>
                  <SelectItem value="current_month">Mes actual</SelectItem>
                  <SelectItem value="month_specific">Mes específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "date_specific" && (
              <div className="space-y-2">
                <Label>Fecha específica</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !specificDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {specificDate ? format(specificDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={specificDate}
                      onSelect={setSpecificDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {reportType === "month_specific" && (
              <div className="space-y-2">
                <Label htmlFor="specificMonth">Mes específico</Label>
                <Input
                  id="specificMonth"
                  type="month"
                  value={specificMonth}
                  onChange={(e) => setSpecificMonth(e.target.value)}
                  placeholder="YYYY-MM"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="VES">VES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? "Generando..." : "Generar Reporte"}
            </Button>
            {reportData && (
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert>
          <AlertDescription>
            Error al generar el reporte: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reportData && (
        <div className="space-y-6">
          {/* Report Title */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-center">
                {generateReportTitle(reportType, reportData.dateRange, specificDate?.toISOString().split('T')[0], specificMonth)}
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Período: {formatDate(reportData.dateRange.startDate)} - {formatDate(reportData.dateRange.endDate)}
              </p>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.stats.totalPayments}</div>
                <p className="text-xs text-muted-foreground">
                  Pagos en el período seleccionado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total USD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.stats.totalAmountUSD, "USD")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.stats.paidPayments} pagos completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total VES</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.stats.totalAmountVES, "VES")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Bolívares recaudados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Pagados:</span>
                    <span className="font-medium">{reportData.stats.paidPayments}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Pendientes:</span>
                    <span className="font-medium">{reportData.stats.pendingPayments}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Fallidos:</span>
                    <span className="font-medium">{reportData.stats.failedPayments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Pagos</CardTitle>
              <CardDescription>
                Lista de todos los pagos en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron pagos en el período seleccionado
                </p>
              ) : (
                <div className="space-y-4">
                  {reportData.payments.map((payment: Payment) => (
                    <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">
                              {payment.client?.firstname} {payment.client?.lastname}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment.clientCedula} • {formatDate(payment.createdAt || new Date())}
                            </p>
                          </div>
                          <Badge className={getPaymentStatusColor(payment.paymentStatus)}>
                            {getPaymentStatusLabel(payment.paymentStatus)}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{payment.service}</span>
                          <span>•</span>
                          <span>{payment.paymentMethod}</span>
                          {payment.paymentReference && (
                            <>
                              <span>•</span>
                              <span>Ref: {payment.paymentReference}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(Number(payment.amount), payment.currency as "USD" | "VES")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentsReport; 