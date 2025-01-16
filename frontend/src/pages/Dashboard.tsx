import { useStore } from "@/hooks/useStore";
import Template from "./Template";
import { ChartNoAxesCombined, Trash2, UsersRound } from "lucide-react";
import SquareWidget from "@/components/SquareWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientData from "@/components/ClientData";
import { useEffect, useState } from "react";
import { ClientDialog } from "@/components/dialogs/ClientDialog";
import { useQuery } from "@tanstack/react-query";
import { getClientsRequest } from "@/api/api";
import { GetClientsResponse } from "@/lib/types";
import Pagination from "@/components/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const InitialClientsResponse: GetClientsResponse = {
  info: {
    total: 0,
    pages: 0,
    next: null,
    prev: null
  },
  results: []
};

const Dashboard = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, refetch: refetchClients } = useQuery<GetClientsResponse>({
    queryKey: ["clients", page, limit, debouncedSearch, sortField, sortOrder],
    queryFn: () => getClientsRequest(page, limit, debouncedSearch, sortField, sortOrder),
  });

  const { info: { total = 0, pages = 0, next = null, prev = null }, results: clients = [] } = data ?? InitialClientsResponse;

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

  const handleChangeSortField = (value: string) => {
    setSortField(value);
    setPage(DEFAULT_PAGE);
  };

  const handleChangeSortOrder = (value: string) => {
    setSortOrder(value);
    setPage(DEFAULT_PAGE);
  };

  return (
    <Template className="flex flex-col gap-4">
      <header>
        <h2 className="text-2xl font-medium">
          Hola, <span className="capitalize">{username}</span>!
        </h2>
        <p className="text-neutral-900 text-sm">Aquí podrás ver los datos de los clientes.</p>
      </header>
      <section className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl">
        <SquareWidget
          className="bg-slate-900 flex-1"
          title={total.toString() ?? "0"}
          subtitle="Total de clientes"
          link="/clients"
          icon={<UsersRound className="text-slate-900 w-8 h-8" />}
          fontColor="text-white"
        />
        <SquareWidget
          className="bg-lime-500 flex-1"
          title={'0'}
          subtitle="Nuevos clientes"
          link="/payments"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-slate-900"
        />
        <SquareWidget
          className="bg-white flex-1"
          title={'0'}
          subtitle="Clientes vencidos la siguiente semana"
          link="/clients"
          icon={<Trash2 className="text-slate-900 w-8 h-8" />}
          fontColor="text-dark"
          iconBgColor="bg-slate-300"
        />
      </section>
      <section className="flex flex-col-reverse lg:flex-row justify-between items-center gap-4 w-full max-w-7xl">
        <Button variant="default" className="w-full lg:w-auto" onClick={handleOpenNewClientModal}>
          Agregar nuevo
        </Button>
        <Input placeholder="Buscar cliente" className="" onChange={handleSearchClient} />
        <Select onValueChange={handleChangeSortField}>
          <SelectTrigger className="w-full lg:w-[250px]">
            <SelectValue defaultValue="updatedAt" placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Última actualización</SelectItem>
            <SelectItem value="firstname">Nombre</SelectItem>
            <SelectItem value="lastname">Apellido</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="expiredDate">Fecha de vencimiento</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleChangeSortOrder}>
          <SelectTrigger className="w-[250px]">
            <SelectValue defaultValue="asc" placeholder="Ordenar de forma" />
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
      </section>
      <section className="data-table w-full max-w-7xl">
        <ClientData
          isLoading={isLoading}
          clients={clients ?? []}
        />
        <Pagination
          total={total}
          pages={pages}
          next={next}
          prev={prev}
          currentPage={page}
          onPageNext={handlePageNext}
          onPagePrev={handlePagePrev}
        />
      </section>
      <ClientDialog onClientCreated={refetchClients} isOpen={isNewClientModalOpen} onOpenChange={handleOpenNewClientModal} />
    </Template>
  );
};

export default Dashboard;
