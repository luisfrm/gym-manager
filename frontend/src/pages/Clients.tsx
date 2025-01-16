import { useStore } from "@/hooks/useStore";
import Template from "./Template";
import { ChartNoAxesCombined, Trash2, UsersRound } from "lucide-react";
import SquareWidget from "@/components/SquareWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientData from "@/components/ClientData";
import { useState } from "react";
import { ClientDialog } from "@/components/dialogs/ClientDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getClientsRequest, deleteClientRequest } from "@/api/api";
import { Client, GetClientsResponse } from "@/lib/types";

const Dashboard = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);



  const { data, isLoading, refetch } = useQuery<GetClientsResponse>({
    queryKey: ["clients"],
    queryFn: getClientsRequest,
  });

  const { total = 0, clients = [], expiringClients = 0, newClientsLastMonth = 0 } = data ?? { total: "0", clients: [], expiringClients: 0, newClientsLastMonth: 0 };

  const handleOpenNewClientModal = () => {
    setIsNewClientModalOpen(!isNewClientModalOpen);
  };

  const deleteClientMutation = useMutation({
    mutationFn: deleteClientRequest,
    onSuccess: () => {
      console.log("Cliente eliminado");
    },
    onError: () => {
      console.log("Error al eliminar cliente");
    },
  });

  const handleDeleteClient = (_id: string) => {
    deleteClientMutation.mutateAsync({ _id }).then(() => {
      refetch();
    });
  };

  const handleUpdateClient = (client: Client) => {
    console.log(client);
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
          title={newClientsLastMonth.toString()}
          subtitle="Nuevos clientes"
          link="/payments"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-slate-900"
        />
        <SquareWidget
          className="bg-white flex-1"
          title={expiringClients.toString()}
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
        <ClientData
          isLoading={isLoading}
          clients={clients ?? []}
        />
      </section>
      <ClientDialog onClientCreated={refetch} isOpen={isNewClientModalOpen} onOpenChange={handleOpenNewClientModal} />
    </Template>
  );
};

export default Dashboard;
