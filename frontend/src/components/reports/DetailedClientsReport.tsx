import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  UserPlus, 
  Crown,
  Calendar,
  Download,
  Eye,
  Phone,
  Mail
} from 'lucide-react';
import { getDetailedClientsReportRequest } from '@/api/api';
import { DetailedClientsReportResponse } from '@/lib/types';
import { formatCurrency, exportToCSV } from '@/lib/utils/reportUtils';

const DetailedClientsReport: React.FC = () => {
  const [reportData, setReportData] = useState<DetailedClientsReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getDetailedClientsReportRequest({ month: selectedMonth });
      setReportData(data);
    } catch (error) {
      console.error('Error fetching detailed clients report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth]);

  const handleExportCSV = (dataType: string, data: any[]) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `reporte_clientes_${dataType}_${selectedMonth}_${timestamp}.csv`;
    exportToCSV(data, filename);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No se pudieron cargar los datos del reporte</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, expiredClients, activeClients, renewedClients, newClients, clientsAtRisk } = reportData;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reporte Detallado de Clientes</h2>
          <p className="text-sm text-gray-500">Análisis completo del estado de clientes - {selectedMonth}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="month">Mes:</Label>
          <Input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                <p className="text-2xl font-bold">{summary.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
                <p className="text-2xl font-bold text-green-600">{summary.activeClients}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clientes Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{summary.expiredClients}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">En Riesgo (7 días)</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.clientsAtRisk}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Nuevos Clientes</p>
                <p className="text-xl font-bold text-blue-600">{summary.newClients}</p>
              </div>
              <UserPlus className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Renovaciones</p>
                <p className="text-xl font-bold text-purple-600">{summary.renewedClients}</p>
              </div>
              <Crown className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Con Face ID</p>
                <p className="text-xl font-bold text-indigo-600">{summary.clientsWithFace}</p>
              </div>
              <Eye className="h-6 w-6 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Segmentación de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{summary.premium}</p>
              <p className="text-sm text-purple-700">Premium ($50+)</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{summary.regular}</p>
              <p className="text-sm text-blue-700">Regular ($20-$49)</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{summary.basic}</p>
              <p className="text-sm text-green-700">Básico ($1-$19)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="expired" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="expired">Vencidos ({summary.expiredClients})</TabsTrigger>
          <TabsTrigger value="active">Activos ({summary.activeClients})</TabsTrigger>
          <TabsTrigger value="renewals">Renovaciones ({summary.renewedClients})</TabsTrigger>
          <TabsTrigger value="new">Nuevos ({summary.newClients})</TabsTrigger>
          <TabsTrigger value="risk">En Riesgo ({summary.clientsAtRisk})</TabsTrigger>
        </TabsList>

        <TabsContent value="expired">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Clientes Vencidos</CardTitle>
              <Button 
                onClick={() => handleExportCSV('vencidos', expiredClients)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiredClients.map((client) => (
                  <div key={client._id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{client.name}</h4>
                        <Badge variant="destructive">Vencido {client.daysExpired} días</Badge>
                        {client.hasFaceRegistered && (
                          <Badge variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Face ID
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">CI: {client.cedula}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Venció:</p>
                      <p className="font-medium">{client.expiredDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Clientes Activos</CardTitle>
              <Button 
                onClick={() => handleExportCSV('activos', activeClients)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeClients.slice(0, 20).map((client) => (
                  <div key={client._id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{client.name}</h4>
                        <Badge variant="default" className="bg-green-500">Activo</Badge>
                        {client.hasFaceRegistered && (
                          <Badge variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Face ID
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">CI: {client.cedula}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {client.daysUntilExpiry !== null && client.daysUntilExpiry !== undefined && client.daysUntilExpiry > 0 && (
                        <>
                          <p className="text-sm text-gray-500">Vence en:</p>
                          <p className="font-medium">{client.daysUntilExpiry} días</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {activeClients.length > 20 && (
                  <p className="text-center text-gray-500 text-sm">
                    Y {activeClients.length - 20} clientes más...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Clientes que Renovaron</CardTitle>
              <Button 
                onClick={() => handleExportCSV('renovaciones', renewedClients)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renewedClients.map((renewal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {renewal.client?.firstname} {renewal.client?.lastname}
                        </h4>
                        <Badge variant="default" className="bg-purple-500">
                          {renewal.paymentsCount} pagos
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">CI: {renewal.client?.cedula}</p>
                      <p className="text-sm text-gray-500">Último pago: {renewal.lastPaymentDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        {renewal.totalAmountUSD > 0 && (
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(renewal.totalAmountUSD, 'USD')}
                          </p>
                        )}
                        {renewal.totalAmountVES > 0 && (
                          <p className="text-sm font-medium text-blue-600">
                            {formatCurrency(renewal.totalAmountVES, 'VES')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Nuevos Clientes</CardTitle>
              <Button 
                onClick={() => handleExportCSV('nuevos', newClients)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newClients.map((client) => (
                  <div key={client._id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{client.name}</h4>
                        <Badge variant="default" className="bg-blue-500">
                          Cliente {client.daysAsClient} días
                        </Badge>
                        {client.hasFaceRegistered && (
                          <Badge variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Face ID
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">CI: {client.cedula}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Registro:</p>
                      <p className="font-medium">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Clientes en Riesgo</CardTitle>
              <Button 
                onClick={() => handleExportCSV('en_riesgo', clientsAtRisk)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientsAtRisk.map((client) => (
                  <div key={client._id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{client.name}</h4>
                        <Badge variant="destructive" className="bg-yellow-500">
                          Vence en {client.daysUntilExpiry ?? 0} días
                        </Badge>
                        {client.hasFaceRegistered && (
                          <Badge variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Face ID
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">CI: {client.cedula}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Vence:</p>
                      <p className="font-medium">{client.expiredDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailedClientsReport; 