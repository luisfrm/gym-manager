import { useState } from "react";
import Template from "./Template";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarDays, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileBarChart,
  Target,
  Zap
} from "lucide-react";
import PaymentsReport from "@/components/reports/PaymentsReport";
import ClientsReport from "@/components/reports/ClientsReport";
import IncomeReport from "@/components/reports/IncomeReport";
import DashboardOverview from "@/components/reports/DashboardOverview";
import DetailedClientsReport from "@/components/reports/DetailedClientsReport";
import DetailedPaymentsReport from "@/components/reports/DetailedPaymentsReport";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const reportOptions = [
    {
      id: "daily",
      title: "Reporte del día",
      description: "Resumen de actividad del día actual",
      icon: <CalendarDays className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      id: "date_specific",
      title: "Fecha específica",
      description: "Selecciona una fecha específica para revisar",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      id: "last_7_days",
      title: "Últimos 7 días",
      description: "Actividad de la última semana",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-purple-500"
    },
    {
      id: "current_week",
      title: "Semana actual",
      description: "Desde el lunes hasta hoy",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-orange-500"
    },
    {
      id: "current_month",
      title: "Mes actual",
      description: "Resumen del mes en curso",
      icon: <FileBarChart className="h-5 w-5" />,
      color: "bg-red-500"
    },
    {
      id: "month_specific",
      title: "Mes específico",
      description: "Selecciona un mes específico",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-indigo-500"
    }
  ];

  return (
    <Template>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Genera reportes detallados de pagos, clientes e ingresos
          </p>
        </div>

        {/* Quick Report Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportOptions.map((option) => (
            <Card key={option.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className={`${option.color} text-white p-2 rounded-md`}>
                  {option.icon}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription className="mt-1">
                  {option.description}
                </CardDescription>
                <div className="flex space-x-2 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Clientes
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Pagos
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Pagos</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center space-x-2">
              <FileBarChart className="h-4 w-4" />
              <span>Ingresos</span>
            </TabsTrigger>
            <TabsTrigger value="detailed-clients" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Clientes+</span>
            </TabsTrigger>
            <TabsTrigger value="detailed-payments" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Pagos+</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentsReport />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientsReport />
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <IncomeReport />
          </TabsContent>

          <TabsContent value="detailed-clients" className="space-y-6">
            <DetailedClientsReport />
          </TabsContent>

          <TabsContent value="detailed-payments" className="space-y-6">
            <DetailedPaymentsReport />
          </TabsContent>
        </Tabs>
      </div>
    </Template>
  );
};

export default Reports; 