import { useStore } from "@/hooks/useStore";
import Template from "./Template";
import { ChartNoAxesCombined, Trash2, UsersRound } from "lucide-react";
import SquareWidget from "@/components/SquareWidget";
import { useQuery } from "@tanstack/react-query";
import { getLogsRequest } from "@/api/api";
import { GetLogsResponse } from "@/lib/types";
import ActivityLogs from "@/components/ActivityLogs";
import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";

const DEFAULT_PAGE = 1;

const InitialLogsResponse: GetLogsResponse = {
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
  const [page, setPage] = useState(DEFAULT_PAGE);

  const { data, isLoading, refetch: refetchLogs } = useQuery<GetLogsResponse>({
    queryKey: ["logs"],
    queryFn: () => getLogsRequest(page),
  });

  const { info: { total, pages, next, prev }, results: logs = [] } = data ?? InitialLogsResponse;


  useEffect(() => {
    refetchLogs();
  }, [page, refetchLogs]);

  const handlePageNext = () => {
    setPage(page + 1);
  };

  const handlePagePrev = () => {
    setPage(page - 1);
  };


  return (
    <Template>
      <header>
        <h2 className="text-2xl font-medium">
          Hola, <span className="capitalize">{username}</span>!
        </h2>
        <p className="text-neutral-900 text-sm">Aquí podrás ver los datos de los clientes.</p>
      </header>
      <section className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl">
        <SquareWidget
          className="bg-slate-900 flex-1"
          title={"0"}
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
      {/* <section className="flex flex-col-reverse lg:flex-row justify-between items-center gap-4 w-full max-w-7xl">
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
      </section> */}
      <section className="data-table w-full max-w-7xl flex flex-col gap-4">
        <ActivityLogs isLoading={isLoading} logs={logs} />
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
    </Template>
  );
};

export default Dashboard;
