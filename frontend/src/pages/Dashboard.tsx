import { useStore } from "@/hooks/useStore";
import Template from "./Template";
import { ChartNoAxesCombined, Trash2, UsersRound } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { username } = useStore(state => state.auth?.user);
  return (
    <Template>
      <header className="mb-6">
        <h2 className="text-2xl font-medium">
          Hola, <span className="capitalize">{username}</span>!
        </h2>
        <p className="text-neutral-900 text-sm">Aquí podrás ver los datos de los clientes.</p>
      </header>
      <section className="flex gap-4">
        <Card className="bg-slate-900 w-1/5">
          <CardHeader className="flex items-start">
            <div className="bg-white p-4 rounded-md">
              <UsersRound className="text-slate-900 w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent className="text-white">
            <h3 className="text-4xl font-medium leading-10">1.548</h3>
            <p className="text-sm">Total de clientes</p>
          </CardContent>
          <CardFooter>
            <Link to="/clients" className="text-white text-sm font-bold hover:underline">
              Ver todos
            </Link>
          </CardFooter>
        </Card>
        <Card className="bg-lime-500 w-1/5">
          <CardHeader className="flex items-start">
            <div className="bg-slate-900 p-4 rounded-md">
              <ChartNoAxesCombined className="text-white w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent className="text-white">
            <h3 className="text-4xl font-medium leading-10">587</h3>
            <p className="text-sm">Nuevos clientes</p>
          </CardContent>
          <CardFooter>
            <Link to="/payments" className="text-white text-sm font-bold hover:underline">
              Ver todos
            </Link>
          </CardFooter>
        </Card>
        <Card className="w-1/5">
          <CardHeader className="flex items-start">
            <div className="bg-slate-300 p-4 rounded-md">
              <Trash2 className="text-slate-900 w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent className="">
            <h3 className="text-4xl font-medium leading-10 text-black">15</h3>
            <p className="text-sm">Clientes vencidos la siguiente semana</p>
          </CardContent>
          <CardFooter>
            <Link to="/clients" className="text-slate-900 text-sm font-bold hover:underline">
              Ver todos
            </Link>
          </CardFooter>
        </Card>
      </section>
    </Template>
  );
};

export default Dashboard;
