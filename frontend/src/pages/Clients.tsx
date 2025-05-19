import { useStore } from "@/hooks/useStore";
import Template from "./Template";
import { ChartNoAxesCombined, Trash2, UsersRound, CalendarClock } from "lucide-react";
import SquareWidget from "@/components/SquareWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientData from "@/components/ClientData";
import { useEffect, useState } from "react";
import { ClientDialog } from "@/components/dialogs/ClientDialog";
import { useQuery } from "@tanstack/react-query";
import { getClientsRequest, getClientStatisticsRequest } from "@/api/api";
import { ClientStatisticsResponse, GetClientsResponse } from "@/lib/types";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import SelectComponent from "@/components/Select";
import WidgetsContainer from "@/components/WidgetsContainer";
import { useQueryClient } from "@tanstack/react-query";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const InitialClientsResponse: GetClientsResponse = {
  info: {
    total: 0,
    pages: 0,
    next: null,
    prev: null,
  },
  results: [],
};

const InitialClientStatisticsResponse: ClientStatisticsResponse = {
  newClientsLastMonth: 0,
  clientsExpiringNextWeek: 0,
  clientsExpiringNext30Days: 0,
  activeClients: 0,
  totalClients: 0,
};

interface Option {
  value: string;
  label: string;
}

const sortOptions: Option[] = [
  { value: "updatedAt", label: "Última actualización" },
  { value: "firstname", label: "Nombre" },
  { value: "lastname", label: "Apellido" },
  { value: "email", label: "Email" },
  { value: "expiredDate", label: "Fecha de vencimiento" },
];

const orderOptions: Option[] = [
  { value: "asc", label: "Ascendente" },
  { value: "desc", label: "Descendente" },
];

const limitsOptions: Option[] = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

const Clients = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    isLoading,
    refetch: refetchClients,
  } = useQuery<GetClientsResponse>({
    queryKey: ["clients", page, limit, debouncedSearch, sortField, sortOrder],
    queryFn: () => getClientsRequest(debouncedSearch, page, limit, sortField, sortOrder),
  });

  const { data: clientStatistic } = useQuery<ClientStatisticsResponse>({
    queryKey: ["clientStatistics"],
    queryFn: () => getClientStatisticsRequest(),
  });

  const {
    info: { pages = 0, next = null, prev = null },
    results: clients = [],
  } = data ?? InitialClientsResponse;

  const { newClientsLastMonth, clientsExpiringNextWeek, totalClients } =
    clientStatistic ?? InitialClientStatisticsResponse;

  const queryClient = useQueryClient();

  const handleOpenNewClientModal = () => {
    setIsNewClientModalOpen(!isNewClientModalOpen);
  };

  const handleChangeLimit = (value: string) => {
    setLimit(parseInt(value));
    setPage(DEFAULT_PAGE);
  };

  const handleSearchClient = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(DEFAULT_PAGE);
  };

  useEffect(() => {
    refetchClients();
  }, [page, limit, refetchClients, debouncedSearch, sortField, sortOrder]);

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
          Hola, <span className="capitalize">{username}</span>! Bienvenido al panel de clientes.
        </h2>
        <p className="text-neutral-900 text-sm">Aquí podrás ver información de los clientes.</p>
      </header>

      <WidgetsContainer>
        <SquareWidget
          className="bg-slate-900 flex-1"
          title={totalClients.toString() ?? "0"}
          subtitle="Total de clientes"
          link="/clients"
          icon={<UsersRound className="text-slate-900 w-8 h-8" />}
          fontColor="text-white"
        />
        <SquareWidget
          className="bg-lime-500 flex-1"
          title={newClientsLastMonth.toString() ?? "0"}
          subtitle="Nuevos clientes"
          link="/clients"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-slate-900"
        />
        <SquareWidget
          className="bg-blue-500 flex-1"
          title={clientsExpiringNextWeek.toString() ?? "0"}
          subtitle="Clientes vencidos la siguiente semana"
          link="/clients"
          icon={<Trash2 className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-blue-700"
        />
        <SquareWidget
          className="bg-emerald-500 flex-1"
          title={clientStatistic?.clientsExpiringNext30Days?.toString() ?? "0"}
          subtitle="Clientes por vencer en 30 días"
          link="/clients"
          icon={<CalendarClock className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-emerald-700"
        />
      </WidgetsContainer>

      <section
        id="clients-filter-bar"
        className="flex flex-col-reverse lg:flex-row justify-between items-center gap-4 w-full"
      >
        <Button variant="default" className="w-full lg:w-auto" onClick={handleOpenNewClientModal}>
          Agregar nuevo
        </Button>
        <Input placeholder="Buscar cliente" className="" onChange={handleSearchClient} />
        <SelectComponent
          onValueChange={handleChangeSortField}
          className="w-full lg:w-[250px]"
          items={sortOptions}
          defaultValue="updatedAt"
          placeholder="Ordenar por"
        />
        <SelectComponent
          onValueChange={handleChangeSortOrder}
          className="w-full lg:w-[250px]"
          items={orderOptions}
          defaultValue="asc"
          placeholder="Ordenar de forma"
        />
        <SelectComponent
          onValueChange={handleChangeLimit}
          className="w-full lg:w-[250px]"
          items={limitsOptions}
          defaultValue={limitsOptions[0].value}
          placeholder="Limite de clientes"
        />
      </section>
      <section className="data-table w-full">
        <ClientData isLoading={isLoading} clients={clients ?? []} limit={limit} />
        {pages > 1 && (
          <Pagination
            isLoading={isLoading}
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
      <ClientDialog
        onClientCreated={() => {
          refetchClients();
          queryClient.invalidateQueries({ queryKey: ["clientStatistics"] });
        }}
        isOpen={isNewClientModalOpen}
        onOpenChange={handleOpenNewClientModal}
      />
    </Template>
  );
};

export default Clients;
