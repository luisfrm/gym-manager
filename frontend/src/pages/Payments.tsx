import PaymentList from "@/components/PaymentList";
import Template from "./Template";
import { GetPaymentsResponse } from "@/lib/types";
import { useStore } from "@/hooks/useStore";
import SquareWidget from "@/components/SquareWidget";
import { ChartNoAxesCombined, DollarSign, Search, Trash2, Receipt, Calendar } from "lucide-react";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientDialog } from "@/components/dialogs/ClientDialog";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { getPaymentsRequest, getPaymentTotalsRequest } from "@/api/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "@/components/Pagination";
import { formatReportTitle } from "@/lib/reports";
import WidgetsContainer from "@/components/WidgetsContainer";
import { useQueryClient } from "@tanstack/react-query";
import { ROLES } from "@/lib/config";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const Payments = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const role = useStore(state => state.auth.user?.role ?? "");
  const [isOpenPaymentDialog, setIsOpenPaymentDialog] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
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
    info: { total = 0, pages = 0, next = null, prev = null },
    results: payments = [],
  } = data ?? InitialPaymentsResponse;

  const { data: paymentTotals } = useQuery({
    queryKey: ["paymentTotals"],
    queryFn: getPaymentTotalsRequest,
  });

  useEffect(() => {
    refetchPayments();
  }, [page, limit, refetchPayments, debouncedSearch, sortField, sortOrder]);

  const onOpenChangePaymentDialog = () => {
    setIsOpenPaymentDialog(!isOpenPaymentDialog);
  };

  const handleOpenNewClientModal = () => {
    setIsNewClientModalOpen(!isNewClientModalOpen);
  };

  const onPaymentCreated = () => {
    refetchPayments();
    queryClient.invalidateQueries({ queryKey: ["paymentTotals"] });
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

  const handleOnUpdatedPayment = () => {
    refetchPayments();
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
          link="/payments"
          icon={<Calendar className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-blue-700"
        />
        <SquareWidget
          className="bg-lime-500 flex-1"
          title={formatReportTitle(paymentTotals?.todayTotal?.current || { USD: 0, VES: 0 })}
          subtitle="Total de ingresos del día"
          link="/payments"
          icon={<Receipt className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-lime-700"
        />
        <SquareWidget
          className="bg-emerald-500 flex-1"
          title={paymentTotals?.currentMonthPaymentsCount?.toString() ?? "0"}
          subtitle="Total de pagos del mes actual"
          link="/payments"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-emerald-700"
        />
        {role === ROLES.ADMIN && (
          <SquareWidget
            className="bg-blue-500 flex-1"
            title={formatReportTitle(paymentTotals?.currentMonthTotal?.current || { USD: 0, VES: 0 })}
            subtitle="Total de ingresos del mes actual"
            link="/payments"
          icon={<DollarSign className="text-slate-900 w-8 h-8" />}
            fontColor="text-white"
          />
        )}
      </WidgetsContainer>
      <section className="data-table w-full flex flex-col gap-4">
        <div className="flex justify-between items-center gap-2">
          <Button className="bg-slate-900 text-white" onClick={onOpenChangePaymentDialog}>
            Agregar pago
          </Button>
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por servicio o cliente..."
              onChange={handleSearchPayments}
              className="pl-8 w-full"
            />
          </div>
          <Select onValueChange={handleChangeSortField}>
            <SelectTrigger className="w-full lg:w-[250px]">
              <SelectValue defaultValue="updatedAt" placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Última actualización</SelectItem>
              <SelectItem value="clientCedula">Cedula</SelectItem>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="serviceName">Servicio</SelectItem>
              <SelectItem value="paymentStatus">Estado</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={handleChangeSortOrder}>
            <SelectTrigger className="w-[250px]">
              <SelectValue defaultValue="desc" placeholder="Descendente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={handleChangeLimit}>
            <SelectTrigger className="w-full lg:w-[250px]">
              <SelectValue defaultValue="10" placeholder="Limite de clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <PaymentList onUpdatedPayment={handleOnUpdatedPayment} payments={payments} isLoading={isLoadingPayments} />
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
      <PaymentDialog
        isOpen={isOpenPaymentDialog}
        onOpenChange={onOpenChangePaymentDialog}
        onPaymentCreated={onPaymentCreated}
      />
      <ClientDialog isOpen={isNewClientModalOpen} onOpenChange={handleOpenNewClientModal} />
    </Template>
  );
};

export default Payments;
