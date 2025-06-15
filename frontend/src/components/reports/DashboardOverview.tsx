import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign, CreditCard } from "lucide-react";
import { getDashboardOverviewRequest } from "@/api/api";
import { formatCurrency } from "@/lib/utils/reportUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DashboardOverview = () => {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverviewRequest,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error al cargar el resumen del dashboard: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!overview) return null;

  const stats = [
    {
      title: "Ingresos del día (USD)",
      value: formatCurrency(overview.today.incomeUSD, "USD"),
      description: `${overview.today.transactionCount} transacciones en total (USD y VES)`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Ingresos del día (VES)",
      value: formatCurrency(overview.today.incomeVES, "VES"),
      description: "Bolívares del día",
      icon: CreditCard,
      color: "text-blue-600"
    },
    {
      title: "Ingresos del mes (USD)",
      value: formatCurrency(overview.month.incomeUSD, "USD"),
      description: `${overview.month.transactionCount} transacciones`,
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Clientes activos",
      value: overview.clients.active.toString(),
      description: `${overview.clients.newThisMonth} nuevos este mes`,
      icon: Users,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen del mes</CardTitle>
            <CardDescription>Datos consolidados del mes actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total USD:</span>
              <span className="font-medium">{formatCurrency(overview.month.incomeUSD, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total VES:</span>
              <span className="font-medium">{formatCurrency(overview.month.incomeVES, "VES")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transacciones:</span>
              <span className="font-medium">{overview.month.transactionCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes</CardTitle>
            <CardDescription>Estadísticas de clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-medium">{overview.clients.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Activos:</span>
              <span className="font-medium">{overview.clients.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nuevos (mes):</span>
              <span className="font-medium">{overview.clients.newThisMonth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad de hoy</CardTitle>
            <CardDescription>Resumen del día actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">USD:</span>
              <span className="font-medium">{formatCurrency(overview.today.incomeUSD, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">VES:</span>
              <span className="font-medium">{formatCurrency(overview.today.incomeVES, "VES")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transacciones:</span>
              <span className="font-medium">{overview.today.transactionCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview; 