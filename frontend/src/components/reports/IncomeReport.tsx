import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Filter, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { getIncomeSummaryReportRequest } from "@/api/api";
import { 
  formatCurrency, 
  formatDate, 
  exportToCSV
} from "@/lib/utils/reportUtils";

const IncomeReport = () => {
  const [reportType, setReportType] = useState("current_month");
  const [specificMonth, setSpecificMonth] = useState("");

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ["income-report", reportType, specificMonth],
    queryFn: () => getIncomeSummaryReportRequest({
      reportType,
      specificMonth
    }),
  });

  const handleGenerateReport = () => {
    refetch();
  };

  const handleExportIncomeByMethodCSV = () => {
    if (!reportData?.incomeByMethod?.length) return;
    
    const exportData = reportData.incomeByMethod.map((item: any) => ({
      'Método de pago': item.method,
      'Moneda': item.currency,
      'Monto': item.amount,
      'Transacciones': item.count,
      'Promedio por transacción': (item.amount / item.count).toFixed(2)
    }));
    
    exportToCSV(exportData, `ingresos-por-metodo-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportIncomeByServiceCSV = () => {
    if (!reportData?.incomeByService?.length) return;
    
    const exportData = reportData.incomeByService.map((item: any) => ({
      'Servicio': item.service,
      'Moneda': item.currency,
      'Monto': item.amount,
      'Transacciones': item.count,
      'Promedio por transacción': (item.amount / item.count).toFixed(2)
    }));
    
    exportToCSV(exportData, `ingresos-por-servicio-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportDailyIncomeCSV = () => {
    if (!reportData?.dailyIncome?.length) return;
    
    const exportData = reportData.dailyIncome.map((item: any) => ({
      'Fecha': formatDate(item.date),
      'Ingresos USD': item.amountUSD,
      'Ingresos VES': item.amountVES,
      'Total transacciones': item.count
    }));
    
    exportToCSV(exportData, `ingresos-diarios-${new Date().toISOString().split('T')[0]}`);
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
            Selecciona los parámetros para generar el reporte de ingresos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ingresos del día</SelectItem>
                  <SelectItem value="last_7_days">Últimos 7 días</SelectItem>
                  <SelectItem value="current_week">Semana actual</SelectItem>
                  <SelectItem value="current_month">Mes actual</SelectItem>
                  <SelectItem value="month_specific">Mes específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? "Generando..." : "Generar Reporte"}
            </Button>
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
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total USD</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.summary.totalIncomeUSD, "USD")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio: {formatCurrency(reportData.summary.averageTransactionUSD, "USD")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total VES</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.summary.totalIncomeVES, "VES")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio: {formatCurrency(reportData.summary.averageTransactionVES, "VES")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  Total de transacciones pagadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Métodos</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.incomeByMethod.length}</div>
                <p className="text-xs text-muted-foreground">
                  Métodos de pago utilizados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Income by Payment Method */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ingresos por Método de Pago</CardTitle>
                <CardDescription>
                  Desglose de ingresos por método de pago y moneda
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportIncomeByMethodCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {reportData.incomeByMethod.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de métodos de pago para mostrar
                </p>
              ) : (
                <div className="space-y-4">
                  {reportData.incomeByMethod.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.method}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.count} transacciones • Moneda: {item.currency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(item.amount, item.currency as "USD" | "VES")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Promedio: {formatCurrency(item.amount / item.count, item.currency as "USD" | "VES")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income by Service */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ingresos por Servicio</CardTitle>
                <CardDescription>
                  Desglose de ingresos por tipo de servicio
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportIncomeByServiceCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {reportData.incomeByService.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de servicios para mostrar
                </p>
              ) : (
                <div className="space-y-4">
                  {reportData.incomeByService.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.count} transacciones • Moneda: {item.currency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(item.amount, item.currency as "USD" | "VES")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Promedio: {formatCurrency(item.amount / item.count, item.currency as "USD" | "VES")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Income */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ingresos Diarios</CardTitle>
                <CardDescription>
                  Desglose día a día de los ingresos
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportDailyIncomeCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {reportData.dailyIncome.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos diarios para mostrar
                </p>
              ) : (
                <div className="space-y-4">
                  {reportData.dailyIncome.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{formatDate(item.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.count} transacciones
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-sm">
                          USD: {formatCurrency(item.amountUSD, "USD")}
                        </p>
                        <p className="font-bold text-sm">
                          VES: {formatCurrency(item.amountVES, "VES")}
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

export default IncomeReport; 