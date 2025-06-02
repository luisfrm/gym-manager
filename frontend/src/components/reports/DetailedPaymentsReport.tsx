import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  BarChart3,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { getDetailedPaymentsReportRequest } from '@/api/api';
import { DetailedPaymentsReportResponse } from '@/lib/types';
import { formatCurrency, exportToCSV } from '@/lib/utils/reportUtils';

const DetailedPaymentsReport: React.FC = () => {
  const [reportData, setReportData] = useState<DetailedPaymentsReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getDetailedPaymentsReportRequest({ 
        month: selectedMonth,
        analytics: includeAnalytics ? "true" : "false"
      });
      setReportData(data);
    } catch (error) {
      console.error('Error fetching detailed payments report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, includeAnalytics]);

  const handleExportCSV = (dataType: string, data: any[]) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `reporte_pagos_${dataType}_${selectedMonth}_${timestamp}.csv`;
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

  const { summary, paidPayments, pendingPayments, failedPayments, highValueTransactions, analytics } = reportData;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reporte Detallado de Pagos</h2>
          <p className="text-sm text-gray-500">Análisis avanzado de transacciones - {selectedMonth}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="analytics">Analytics:</Label>
            <Switch
              id="analytics"
              checked={includeAnalytics}
              onCheckedChange={setIncludeAnalytics}
            />
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pagos</p>
                <p className="text-2xl font-bold">{summary.totalPayments}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tasa de éxito: {summary.successRate}%
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pagos Exitosos</p>
                <p className="text-2xl font-bold text-green-600">{summary.paidPayments}</p>
                <div className="space-y-1 mt-1">
                  <p className="text-xs text-green-600">{formatCurrency(summary.totalRevenueUSD, 'USD')}</p>
                  <p className="text-xs text-blue-600">{formatCurrency(summary.totalRevenueVES, 'VES')}</p>
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pendingPayments}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Requieren seguimiento
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Fallidos</p>
                <p className="text-2xl font-bold text-red-600">{summary.failedPayments}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Necesitan atención
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">USD:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.totalRevenueUSD, 'USD')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">VES:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(summary.totalRevenueVES, 'VES')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Promedios por Transacción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Promedio USD:</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(summary.averageTransactionUSD, 'USD')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Promedio VES:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(summary.averageTransactionVES, 'VES')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {includeAnalytics && analytics && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Análisis Avanzado
          </h3>
          
          {/* Currency Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Moneda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>USD</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{analytics.currencyDistribution.USD.count} pagos</p>
                      <p className="text-sm text-gray-500">{analytics.currencyDistribution.USD.percentage}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>VES</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{analytics.currencyDistribution.VES.count} pagos</p>
                      <p className="text-sm text-gray-500">{analytics.currencyDistribution.VES.percentage}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comportamiento de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nuevos clientes:</span>
                    <Badge variant="outline" className="bg-blue-50">
                      {analytics.clientBehavior.newCustomers}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clientes recurrentes:</span>
                    <Badge variant="outline" className="bg-green-50">
                      {analytics.clientBehavior.returningCustomers}
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">Promedio por pago:</p>
                    <div className="space-y-1">
                      <p className="text-sm">{formatCurrency(analytics.clientBehavior.averagePaymentValue.USD, 'USD')}</p>
                      <p className="text-sm">{formatCurrency(analytics.clientBehavior.averagePaymentValue.VES, 'VES')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.methodPerformance).map(([method, data]) => (
                  <div key={method} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{method}</h4>
                      <Badge 
                        variant={data.successRate >= 80 ? "default" : data.successRate >= 60 ? "secondary" : "destructive"}
                        className={data.successRate >= 80 ? "bg-green-500" : data.successRate >= 60 ? "bg-yellow-500" : "bg-red-500"}
                      >
                        {data.successRate}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span>Total:</span>
                        <span>{data.total}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Exitosos:</span>
                        <span className="text-green-600">{data.paid}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Pendientes:</span>
                        <span className="text-yellow-600">{data.pending}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Fallidos:</span>
                        <span className="text-red-600">{data.failed}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{analytics.timeAnalytics.averagePaymentsPerDay}</p>
                  <p className="text-sm text-blue-700">Pagos promedio/día</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{analytics.timeAnalytics.successRate}%</p>
                  <p className="text-sm text-green-700">Tasa de éxito</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-purple-600">{analytics.timeAnalytics.responseTime}</p>
                  <p className="text-sm text-purple-700">Tiempo respuesta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Spenders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top 5 Clientes del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.clientBehavior.topSpenders.slice(0, 5).map((spender, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {spender.client?.firstname} {spender.client?.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{spender.paymentCount} pagos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {spender.totalUSD > 0 && (
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(spender.totalUSD, 'USD')}
                        </p>
                      )}
                      {spender.totalVES > 0 && (
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(spender.totalVES, 'VES')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tables */}
      <Tabs defaultValue="paid" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="paid">Pagados ({summary.paidPayments})</TabsTrigger>
          <TabsTrigger value="pending">Pendientes ({summary.pendingPayments})</TabsTrigger>
          <TabsTrigger value="failed">Fallidos ({summary.failedPayments})</TabsTrigger>
          <TabsTrigger value="high-value">Alto Valor ({highValueTransactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="paid">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pagos Completados</CardTitle>
              <Button 
                onClick={() => handleExportCSV('pagados', paidPayments)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paidPayments.slice(0, 20).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {payment.client?.firstname} {payment.client?.lastname}
                        </h4>
                        <Badge variant="default" className="bg-green-500">Pagado</Badge>
                        <Badge variant="outline">{payment.service}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {payment.paymentMethod} • {payment.date}
                      </p>
                      {payment.paymentReference && (
                        <p className="text-xs text-gray-500">Ref: {payment.paymentReference}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {paidPayments.length > 20 && (
                  <p className="text-center text-gray-500 text-sm">
                    Y {paidPayments.length - 20} pagos más...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pagos Pendientes</CardTitle>
              <Button 
                onClick={() => handleExportCSV('pendientes', pendingPayments)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {payment.client?.firstname} {payment.client?.lastname}
                        </h4>
                        <Badge variant="secondary" className="bg-yellow-500 text-white">
                          Pendiente {payment.daysPending} días
                        </Badge>
                        <Badge variant="outline">{payment.service}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {payment.paymentMethod} • {payment.date}
                      </p>
                      {payment.paymentReference && (
                        <p className="text-xs text-gray-500">Ref: {payment.paymentReference}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pagos Fallidos</CardTitle>
              <Button 
                onClick={() => handleExportCSV('fallidos', failedPayments)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failedPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {payment.client?.firstname} {payment.client?.lastname}
                        </h4>
                        <Badge variant="destructive">Fallido</Badge>
                        <Badge variant="outline">{payment.service}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {payment.paymentMethod} • {payment.date}
                      </p>
                      <p className="text-xs text-red-600">
                        Razón: {payment.failureReason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-value">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Transacciones de Alto Valor</CardTitle>
              <Button 
                onClick={() => handleExportCSV('alto_valor', highValueTransactions)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highValueTransactions.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {payment.client?.firstname} {payment.client?.lastname}
                        </h4>
                        <Badge variant="default" className="bg-purple-500">Alto Valor</Badge>
                        <Badge variant="outline">{payment.service}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {payment.paymentMethod} • {payment.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {highValueTransactions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay transacciones de alto valor en este período
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailedPaymentsReport; 