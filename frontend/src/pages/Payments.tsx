import PaymentList from "@/components/PaymentList";
import Template from "./Template";
import { GetPaymentsResponse } from "@/lib/types";
import { useStore } from "@/hooks/useStore";
import SquareWidget from "@/components/SquareWidget";
import { ChartNoAxesCombined, DollarSign, Search, Receipt, Calendar, Plus, UserPlus } from "lucide-react";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { ClientWithPaymentDialog } from "@/components/dialogs/ClientWithPaymentDialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { getPaymentsRequest, getPaymentTotalsRequest } from "@/api/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "@/components/Pagination";
import { formatReportTitle } from "@/lib/reports";
import WidgetsContainer from "@/components/WidgetsContainer";
import { useQueryClient } from "@tanstack/react-query";
import { ROLES } from "@/lib/config";
import SelectComponent from "@/components/Select";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

interface Option {
  value: string;
  label: string;
}

const sortOptions: Option[] = [
  { value: "updatedAt", label: "Última actualización" },
  { value: "clientCedula", label: "Cédula" },
  { value: "date", label: "Fecha" },
  { value: "serviceName", label: "Servicio" },
  { value: "paymentStatus", label: "Estado" },
];

const orderOptions: Option[] = [
  { value: "asc", label: "Ascendente" },
  { value: "desc", label: "Descendente" },
];

const limitsOptions: Option[] = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "30", label: "30" },
  { value: "50", label: "50" },
];

const Payments = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const role = useStore(state => state.auth.user?.role ?? "");
  const [isOpenPaymentDialog, setIsOpenPaymentDialog] = useState(false);
  const [isClientWithPaymentModalOpen, setIsClientWithPaymentModalOpen] = useState(false);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const debouncedSearch = useDebounce(search, 500);
  const queryClient = useQueryClient();

  const InitialPaymentsResponse: GetPaymentsResponse = {
    info: {
      total: 0,
      pages: 0,
      next: null,
      prev: null,
    },
    results: [],
  };

  const {
    data,
    isLoading: isLoadingPayments,
    refetch: refetchPayments,
  } = useQuery<GetPaymentsResponse>({
    queryKey: ["payments", page, limit, debouncedSearch, sortField, sortOrder],
    queryFn: () => getPaymentsRequest(page, limit, debouncedSearch, sortField, sortOrder),
  });

  const {
    info: { pages = 0, next = null, prev = null },
    results: payments = [],
  } = data ?? InitialPaymentsResponse;

  const { data: paymentTotals, refetch: refetchPaymentTotals } = useQuery({
    queryKey: ["paymentTotals"],
    queryFn: getPaymentTotalsRequest,
  });

  // Función centralizada para refrescar datos después de crear/actualizar pagos
  const handleDataRefresh = () => {
    refetchPayments();
    queryClient.invalidateQueries({ queryKey: ["paymentTotals"] });
    refetchPaymentTotals();
  };

  useEffect(() => {
    refetchPayments();
  }, [page, limit, refetchPayments, debouncedSearch, sortField, sortOrder]);

  const onOpenChangePaymentDialog = () => {
    setIsOpenPaymentDialog(!isOpenPaymentDialog);
  };

  const handleOpenClientWithPaymentModal = () => {
    setIsClientWithPaymentModalOpen(!isClientWithPaymentModalOpen);
  };

  const handleSearchPayments = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(DEFAULT_PAGE);
  };

  const handleChangeLimit = (value: string) => {
    setLimit(parseInt(value));
    setPage(DEFAULT_PAGE);
  };

  const handlePageNext = () => {
    setPage(page + 1);
  };

  const handlePagePrev = () => {
    setPage(page - 1);
  };

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const handleChangeSortField = (value: string) => {
    setSortField(value);
    setPage(DEFAULT_PAGE);
  };

  const handleChangeSortOrder = (value: string) => {
    setSortOrder(value);
    setPage(DEFAULT_PAGE);
  };

  return (
    <Template>
      <header>
        <h2 className="text-2xl font-medium">
          Hola, <span className="capitalize">{username}</span>! Bienvenido al panel de pagos.
        </h2>
        <p className="text-neutral-900 text-sm">Aquí podrás ver información de los pagos.</p>
      </header>

      <WidgetsContainer>
        <SquareWidget
          className="bg-slate-900 flex-1"
          title={paymentTotals?.todayPaymentsCount?.toString() ?? "0"}
          subtitle="Total de pagos del día actual"
          icon={<Calendar className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-slate-800"
        />
        <SquareWidget
          className="bg-lime-500 flex-1"
          title={formatReportTitle(paymentTotals?.todayTotal?.current || { USD: 0, VES: 0 })}
          subtitle="Total de ingresos del día"
          icon={<Receipt className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-lime-700"
        />
        <SquareWidget
          className="bg-emerald-500 flex-1"
          title={paymentTotals?.currentMonthPaymentsCount?.toString() ?? "0"}
          subtitle="Total de pagos del mes actual"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-emerald-700"
        />
        {role === ROLES.ADMIN && (
          <SquareWidget
            className="bg-blue-500 flex-1"
            title={formatReportTitle(paymentTotals?.currentMonthTotal?.current || { USD: 0, VES: 0 })}
            subtitle="Total de ingresos del mes actual"
            icon={<DollarSign className="text-white w-8 h-8" />}
            fontColor="text-white"
            iconBgColor="bg-blue-700"
          />
        )}
      </WidgetsContainer>

      <section
        id="payments-filter-bar"
        className="flex flex-col-reverse lg:flex-row justify-between items-center gap-4 w-full"
      >
        <div className="flex gap-2 w-full lg:w-auto">
          <Button variant="default" className="flex-1 lg:flex-none" onClick={onOpenChangePaymentDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar pago
          </Button>
          <Button variant="outline" className="flex-1 lg:flex-none" onClick={handleOpenClientWithPaymentModal}>
            <UserPlus className="w-4 h-4 mr-2" />
            Cliente + Pago
          </Button>
        </div>
        
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por servicio o cliente..."
            onChange={handleSearchPayments}
            className="pl-10 w-full"
          />
        </div>
        
        <SelectComponent
          onValueChange={handleChangeSortField}
          className="w-full lg:w-[200px]"
          items={sortOptions}
          defaultValue="updatedAt"
          placeholder="Ordenar por"
        />
        
        <SelectComponent
          onValueChange={handleChangeSortOrder}
          className="w-full lg:w-[150px]"
          items={orderOptions}
          defaultValue="desc"
          placeholder="Orden"
        />
        
        <SelectComponent
          onValueChange={handleChangeLimit}
          className="w-full lg:w-[120px]"
          items={limitsOptions}
          defaultValue="10"
          placeholder="Mostrar"
        />
      </section>

      <section className="data-table w-full">
        <PaymentList onUpdatedPayment={handleDataRefresh} payments={payments} isLoading={isLoadingPayments} />
        {pages > 1 && (
          <Pagination
            isLoading={isLoadingPayments}
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
      
      {/* Diálogos optimizados - solo props esenciales */}
      <PaymentDialog
        isOpen={isOpenPaymentDialog}
        onOpenChange={onOpenChangePaymentDialog}
        onPaymentCreated={handleDataRefresh}
      />
      <ClientWithPaymentDialog
        isOpen={isClientWithPaymentModalOpen}
        onOpenChange={handleOpenClientWithPaymentModal}
        onClientAndPaymentCreated={handleDataRefresh}
      />
    </Template>
  );
};

export default Payments;
