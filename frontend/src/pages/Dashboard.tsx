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
import { Client } from "@/lib/types";

const Dashboard = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: getClientsRequest
  });

  const handleOpenNewClientModal = () => {
    setIsNewClientModalOpen(!isNewClientModalOpen);

    if (!isNewClientModalOpen) {
      refetch();
    }
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
          title={data?.length.toString() ?? "0"}
          subtitle="Total de clientes"
          link="/clients"
          icon={<UsersRound className="text-slate-900 w-8 h-8" />}
          fontColor="text-white"
        />
        <SquareWidget
          className="bg-lime-500 flex-1"
          title="587"
          subtitle="Nuevos clientes"
          link="/payments"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-slate-900"
        />
        <SquareWidget
          className="bg-white flex-1"
          title="15"
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
        <Input placeholder="Buscar cliente" className="w-full lg:w-[200px]" />
      </section>
      <section className="data-table w-full max-w-7xl">
        <ClientData isLoading={isLoading} clients={data ?? []} />
      </section>
      <ClientDialog isOpen={isNewClientModalOpen} onOpenChange={handleOpenNewClientModal} />
    </Template>
  );
};

export default Dashboard;
