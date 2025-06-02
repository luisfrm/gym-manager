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
import { Download, Filter, Users, UserCheck } from "lucide-react";
import { getClientsReportRequest } from "@/api/api";
import { 
  formatCurrency, 
  formatDate, 
  exportToCSV
} from "@/lib/utils/reportUtils";

const ClientsReport = () => {
  const [reportType, setReportType] = useState("current_month");
  const [specificMonth, setSpecificMonth] = useState("");

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ["clients-report", reportType, specificMonth],
    queryFn: () => getClientsReportRequest({
      reportType,
      specificMonth
    }),
  });

  const handleGenerateReport = () => {
    refetch();
  };

  const handleExportCSV = () => {
    if (!reportData?.newClients?.length) return;
    
    const exportData = reportData.newClients.map((client: any) => ({
      'Fecha de registro': formatDate(client.createdAt),
      'Nombre': client.firstname,
      'Apellido': client.lastname,
      'Cédula': client.cedula,
      'Email': client.email || '',
      'Teléfono': client.phone || '',
      'Dirección': client.address || '',
      'Fecha de vencimiento': client.expiredDate || '',
      'Reconocimiento facial': client.hasFaceRegistered ? 'Sí' : 'No'
    }));
    
    exportToCSV(exportData, `reporte-clientes-${new Date().toISOString().split('T')[0]}`);
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
            Selecciona los parámetros para generar el reporte de clientes
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
                  <SelectItem value="daily">Clientes del día</SelectItem>
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
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  Clientes registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos en período</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.stats.newClientsInPeriod}</div>
                <p className="text-xs text-muted-foreground">
                  Registrados en el período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.stats.activeClients}</div>
                <p className="text-xs text-muted-foreground">
                  Con pagos recientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Con Face ID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.stats.clientsWithFaceRecognition}</div>
                <p className="text-xs text-muted-foreground">
                  Reconocimiento facial activo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* New Clients List */}
          <Card>
            <CardHeader>
              <CardTitle>Nuevos Clientes</CardTitle>
              <CardDescription>
                Clientes registrados en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.newClients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No se registraron nuevos clientes en el período seleccionado
                </p>
              ) : (
                <div className="space-y-4">
                  {reportData.newClients.map((client: any) => (
                    <div key={client._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">
                              {client.firstname} {client.lastname}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {client.cedula} • {formatDate(client.createdAt)}
                            </p>
                          </div>
                          {client.hasFaceRegistered && (
                            <Badge variant="secondary">
                              Face ID
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                          {client.email && <span>{client.email}</span>}
                          {client.phone && (
                            <>
                              <span>•</span>
                              <span>{client.phone}</span>
                            </>
                          )}
                          {client.expiredDate && (
                            <>
                              <span>•</span>
                              <span>Vence: {formatDate(client.expiredDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Payment Summary */}
          {reportData.clientPaymentSummary?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Pagos por Cliente</CardTitle>
                <CardDescription>
                  Clientes con actividad de pagos en el período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.clientPaymentSummary.map((summary: any) => (
                    <div key={summary.client._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">
                              {summary.client.firstname} {summary.client.lastname}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {summary.client.cedula} • {summary.paymentCount} pagos
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>USD: {formatCurrency(summary.totalAmountUSD, "USD")}</span>
                          <span>•</span>
                          <span>VES: {formatCurrency(summary.totalAmountVES, "VES")}</span>
                          {summary.lastPayment && (
                            <>
                              <span>•</span>
                              <span>Último: {formatDate(summary.lastPayment)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsReport; 