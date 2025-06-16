import { useState } from "react";
import Template from "./Template";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
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