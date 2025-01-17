import PaymentList from "@/components/PaymentList";
import Template from "./Template";
import { Payment } from "@/lib/types";
import { useStore } from "@/hooks/useStore";
import SquareWidget from "@/components/SquareWidget";
import { ChartNoAxesCombined, DollarSign, Search, Trash2 } from "lucide-react";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientDialog } from "@/components/dialogs/ClientDialog";

const examplePayments: Payment[] = [
  {
    _id: "1",
    client: {
      _id: "c1",
      cedula: "12345678",
      firstname: "Juan",
      lastname: "Pérez",
      email: "juan@example.com",
      phone: "+58 412-1234567",
      address: "Caracas, Venezuela",
      expiredDate: "2025-12-31",
    },
    amount: "50",
    date: "2025-01-15T10:00:00Z",
    service: "Mensualidad",
    paymentMethod: "Transferencia",
    paymentReference: "REF123456",
    paymentStatus: "paid",
    currency: "USD",
  },
  {
    _id: "2",
    client: {
      _id: "c2",
      cedula: "87654321",
      firstname: "María",
      lastname: "González",
      email: "maria@example.com",
      phone: "+58 414-7654321",
      address: "Maracaibo, Venezuela",
      expiredDate: "2025-11-30",
    },
    amount: "200",
    date: "2025-01-14T14:30:00Z",
    service: "Entrenamiento personal",
    paymentMethod: "Efectivo",
    paymentReference: "EFE789012",
    paymentStatus: "pending",
    currency: "VES",
  },
];

const Payments = () => {
  const username = useStore(state => state.auth.user?.username ?? "");
  const [isOpenPaymentDialog, setIsOpenPaymentDialog] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const onOpenChangePaymentDialog = () => {
    setIsOpenPaymentDialog(!isOpenPaymentDialog);
  }

  const handleOpenNewClientModal = () => {
    setIsNewClientModalOpen(!isNewClientModalOpen);
  };

  const onPaymentCreated = () => {
    
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    console.log(searchTerm);
  };


  return (
    <Template>
      <header>
        <h2 className="text-2xl font-medium">
          Hola, <span className="capitalize">{username}</span>! Bienvenido al panel de pagos.
        </h2>
        <p className="text-neutral-900 text-sm">Aquí podrás ver los datos de los pagos.</p>
      </header>
      <section className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl">
        <SquareWidget
          className="bg-slate-900 flex-1"
          title={"0"}
          subtitle="Total de ingresos del mes actual"
          link="/clients"
          icon={<DollarSign className="text-slate-900 w-8 h-8" />}
          fontColor="text-white"
        />
        <SquareWidget
          className="bg-lime-500 flex-1"
          title={"0"}
          subtitle="Total de ingresos de la semana pasada"
          link="/payments"
          icon={<ChartNoAxesCombined className="text-white w-8 h-8" />}
          fontColor="text-white"
          iconBgColor="bg-slate-900"
        />
        <SquareWidget
          className="bg-white flex-1"
          title={"0"}
          subtitle="Total de ingresos del mes anterior"
          link="/clients"
          icon={<Trash2 className="text-slate-900 w-8 h-8" />}
          fontColor="text-dark"
          iconBgColor="bg-slate-300"
        />
      </section>
      <section className="data-table w-full max-w-7xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button className="bg-slate-900 text-white" onClick={onOpenChangePaymentDialog}>Agregar pago</Button>
          <Button className="bg-lime-500 hover:bg-lime-400 text-white" onClick={handleOpenNewClientModal}>Agregar cliente</Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por servicio o cliente..."
            onChange={handleSearch}
            className="pl-8 w-[270px]"
          />
        </div>
      </div>
        <PaymentList payments={examplePayments} />
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
