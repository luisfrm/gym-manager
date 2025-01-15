import { useStore } from "@/hooks/useStore";
import Template from "./Template";
import { UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Clients = () => {
  const username = useStore(state => state.auth?.user?.username);
  return (
    <Template>
      <header>
        <h2 className="text-2xl font-medium">
          Hola, <span className="capitalize">{username}</span>!
        </h2>
        <p className="text-neutral-900 text-sm">Aquí podrás ver los datos de los clientes.</p>
      </header>
      <section>
        <Card className="bg-slate-900">
          <CardHeader className="flex items-start">
            <div className="bg-white p-4 rounded-md">
              <UsersRound className="text-slate-900" />
            </div>
          </CardHeader>
          <CardContent className="text-white">
            <h3 className="text-2xl font-medium leading-10">58 Clientes</h3>
            <p className="text-sm">Total de clientes</p>
          </CardContent>
        </Card>
      </section>
    </Template>
  );
};

export default Clients;
