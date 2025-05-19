import { useStore } from "@/hooks/useStore";
import Template from "./Template";
import { ChartNoAxesCombined, DollarSign, TrendingUp, UsersRound, UserCheck } from "lucide-react";
import SquareWidget from "@/components/SquareWidget";
import { useQuery } from "@tanstack/react-query";
import { getLogsRequest, getClientStatisticsRequest, getPaymentTotalsRequest } from "@/api/api";
import { GetLogsResponse } from "@/lib/types";
import ActivityLogs from "@/components/ActivityLogs";
import { useCallback, useState } from "react";
import Pagination from "@/components/Pagination";
import { formatCurrency } from "@/lib/currency";
import { formatReportTitle } from "@/lib/reports";
import WidgetsContainer from "@/components/WidgetsContainer";

const DEFAULT_PAGE = 1;

interface DashboardStats {
  totalClients: number;
  newClientsLastMonth: number;
  currentUSD: number;
  growthPercentage: number;
}

const InitialLogsResponse: GetLogsResponse = {
  info: {
    total: 0,
    pages: 0,
    next: null,
    prev: null,
  },
  results: [],
};

const Dashboard = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const [page, setPage] = useState(DEFAULT_PAGE);

  // Queries
  const {
    data: logsData,
    isLoading: isLoadingLogs,
  } = useQuery<GetLogsResponse>({
    queryKey: ["logs", page],
    queryFn: () => getLogsRequest(page),
  });

  const { data: clientStatistics } = useQuery({
    queryKey: ["clientStatistics"],
    queryFn: getClientStatisticsRequest,
  });

  const { data: paymentTotals } = useQuery({
    queryKey: ["paymentTotals"],
    queryFn: getPaymentTotalsRequest,
  });

  // Data processing
  const {
    info: { pages, next, prev },
    results: logs = [],
  } = logsData ?? InitialLogsResponse;

  const { newClientsLastMonth = 0, totalClients = 0 } = clientStatistics ?? {};
  const { current = { USD: 0 }, change = 0 } = paymentTotals ?? {};

  const stats: DashboardStats = {
    totalClients,
    newClientsLastMonth,
    currentUSD: current.USD,
    growthPercentage: change,
  };

  // Handlers
  const handlePageNext = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const handlePagePrev = useCallback(() => {
    setPage(prev => prev - 1);
  }, []);

  const handlePageChange = useCallback((value: number) => {
    setPage(value);
  }, []);

  return (
    <Template>
      <header>
        <h2 className="text-2xl font-medium">
          Hola, <span className="capitalize">{username}</span>!
        </h2>
        <p className="text-neutral-900 text-sm">Bienvenido a tu dashboard.</p>
      </header>

      <WidgetsContainer>
        <SquareWidget
          className="bg-slate-900 flex-1"
          title={stats.totalClients.toString()}
          subtitle="Total de clientes"
          link="/clients"
          icon={<UsersRound className="text-slate-900 w-8 h-8" />}
          fontColor="text-white"
        />
        <SquareWidget
          className="bg-lime-500 flex-1"
          title={stats.newClientsLastMonth.toString()}
          subtitle="Nuevos clientes este mes"
          link="/clients"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-slate-900"
        />
        <SquareWidget
          className="bg-blue-500 flex-1"
          title={formatReportTitle(
            paymentTotals?.currentMonthTotal?.current || { USD: 0, VES: 0 }
          )}
          subtitle="Ingresos del mes actual"
          link="/payments"
          icon={<DollarSign className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-blue-700"
        />
        <SquareWidget
          className="bg-emerald-500 flex-1"
          title={clientStatistics?.activeClients?.toString() ?? "0"}
          subtitle="Clientes activos"
          link="/clients"
          icon={<UserCheck className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-emerald-700"
        />
      </WidgetsContainer>

      <section className="data-table w-full max-w-7xl flex flex-col gap-4 mt-6">
        <ActivityLogs isLoading={isLoadingLogs} logs={logs} />
        {pages > 1 && (
          <Pagination
            isLoading={isLoadingLogs}
            totalPages={pages}
            next={next}
            prev={prev}
            currentPage={page}
            onPageNext={handlePageNext}
            onPagePrev={handlePagePrev}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </Template>
  );
};

export default Dashboard;
