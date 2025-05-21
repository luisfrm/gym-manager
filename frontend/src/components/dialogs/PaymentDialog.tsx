import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup } from "@/components/FormGroup";
import { Button } from "../ui/button";
import { Client, GetClientsResponse } from "@/lib/types";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPaymentRequest, getClientsRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, CircleX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import InputSearch from "../ClientInputSearch";
import formatNumber from "@/lib/formatNumber";
import { FormInput } from "../ui/form-input";
import { DateInput } from "../ui/date-input";
import { FormSelect } from "../ui/form-select";
import { Currency, getCurrencyOptions } from "@/lib/currency";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onPaymentCreated?: () => void;
}

const paymentSchema = z.object({
  client: z.string().min(1, { message: "El cliente es requerido" }),
  clientCedula: z.string().min(1, { message: "La cédula del cliente es requerida" }),
  clientName: z.string().min(1, { message: "El nombre del cliente es requerido" }),
  amount: z.string().min(1, { message: "El monto es requerido" }),
  date: z.string().min(1, { message: "La fecha es requerida" }),
  service: z.string().min(1, { message: "El servicio es requerido" }),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, { message: "El método de pago es requerido" }),
  paymentReference: z.string(),
  paymentStatus: z.enum(["pending", "paid", "failed"]),
  currency: z.enum(["USD", "VES"]),
  expiredDate: z.string().min(1, { message: "La fecha de expiración es requerida" }),
});

const initialValues: PaymentSchema = {
  client: "",
  clientCedula: "",
  clientName: "",
  amount: "0",
  date: new Date().toISOString().split('T')[0],
  service: "",
  paymentMethod: "",
  paymentReference: "",
  paymentStatus: "pending",
  expiredDate: new Date().toISOString().split('T')[0],
  currency: "USD",
};

type PaymentSchema = z.infer<typeof paymentSchema>;

export const PaymentDialog = ({ isOpen, onOpenChange, onPaymentCreated = () => {} }: PaymentDialogProps) => {
  const [filterValue, setFilterValue] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>("USD");
  const [client, setClient] = useState<Client | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialValues,
  });

  const currentDate = watch('date');
  const currentExpiredDate = watch('expiredDate');

  const adjustDate = (months: number) => {
    if (!currentDate) return;
    
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + months);
    setValue('date', date.toISOString().split('T')[0]);
  };

  const adjustExpiredDate = (months: number) => {
    if (!currentExpiredDate) return;
    
    const date = new Date(currentExpiredDate);
    date.setMonth(date.getMonth() + months);
    setValue('expiredDate', date.toISOString().split('T')[0]);
  };

  const { data: clients, isLoading: clientsLoading } = useQuery<GetClientsResponse>({
    queryKey: ["clients", filterValue],
    queryFn: () => getClientsRequest(filterValue),
    enabled: !!filterValue,
  });

  const handleCreatePayment = (data: PaymentSchema) => {
    const {
      client: clientId,
      clientCedula,
      amount,
      date,
      service,
      paymentMethod,
      paymentReference,
      expiredDate,
    } = data;
    createPaymentMutation.mutate({
      client: clientId,
      clientCedula,
      amount,
      date,
      service,
      paymentMethod,
      paymentReference,
      paymentStatus,
      currency: paymentCurrency,
      expiredDate,
    });
  };

  const createPaymentMutation = useMutation({
    mutationFn: createPaymentRequest,
    onSuccess: () => {
      onPaymentCreated();
      reset({
        ...initialValues,
        client: client?._id || "",
        clientCedula: client?.cedula || "",
        clientName: client ? `${client.firstname} ${client.lastname}` : "",
      });
      onOpenChange();
      toast("Pago registrado.", {
        description: "El pago se ha registrado correctamente.",
        duration: 5000,
        icon: <CheckCircle className="text-lime-500" />,
      });
      setFilterValue("");
    },
    onError: (error: any) => {
      if (error?.response?.data?.errors) {
        const refError = error.response.data.errors.find((e: any) => e.field === "paymentReference");
        if (refError) {
          toast("Error al crear pago", {
            description: refError.message,
            duration: 5000,
            icon: <CircleX className="text-red-600" />,
          });
          return;
        }
      }
      toast("Error al crear pago", {
        description: "Por favor, intenta de nuevo o contacta con el administrador.",
        duration: 5000,
        icon: <CircleX className="text-red-600" />,
      });
    },
  });

  const handlePaymentStatusChange = (value: "pending" | "paid" | "failed") => {
    setPaymentStatus(value);
  };

  const handlePaymentCurrencyChange = (value: Currency) => {
    setPaymentCurrency(value);
  };

  useEffect(() => {
    if (!isOpen) {
      setFilterValue("");
      reset();
    }
  }, [isOpen, reset]);

  const handleClientSelect = (client: Client) => {
    setClient(client);
    setValue("client", client._id);
    setValue("clientCedula", client.cedula);
    setValue("clientName", `${client.firstname} ${client.lastname}`);
    setFilterValue("");
    toast.success("Cliente seleccionado correctamente", {
      description: `${client.firstname} ${client.lastname} - ${formatNumber(client.cedula)}`,
      duration: 3000,
    });
  };

  const handleClientSearch = (value: string) => {
    setFilterValue(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove leading zeros
    value = value.replace(/^0+/, '');
    
    // If empty, set to 0
    if (!value) {
      value = '0';
    }
    
    // Update input value without formatting
    e.target.value = value;
    setValue('amount', value);
  };

  const handleAmountBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If value is 0, keep it as "0" without decimals
    if (value === "0") {
      e.target.value = "0";
      setValue('amount', "0");
      return;
    }
    
    // Format to 2 decimal places only for non-zero values
    const formattedValue = Number(value).toFixed(2);
    
    // Update input value with formatting
    e.target.value = formattedValue;
    setValue('amount', formattedValue);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Registrar pago" description="Registra un nuevo pago en la base de datos." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleCreatePayment)} className="grid grid-cols-2 gap-4">
          <FormGroup className="col-span-2">
            <InputSearch
              clients={clients?.results ?? []}
              onSelect={handleClientSelect}
              placeholder="Buscar cliente por cédula o nombre"
              label="Cliente"
              onChange={handleClientSearch}
              isLoading={clientsLoading}
            />
          </FormGroup>
          <FormGroup>
            <FormInput
              label="Nombre del cliente"
              name="clientName"
              register={register}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <FormInput
              label="Cédula del cliente"
              name="clientCedula"
              register={register}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <FormInput
              label="Monto"
              name="amount"
              register={register}
              error={errors.amount?.message}
              placeholder={`Monto en ${paymentCurrency}`}
              required
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              disabled={!client}
            />
          </FormGroup>
          <FormGroup>
            <DateInput
              label="Fecha"
              name="date"
              register={register}
              error={errors.date?.message}
              onAdjustDate={adjustDate}
              required
              disabled={!client}
            />
          </FormGroup>
          <FormGroup>
            <FormInput
              label="Servicio"
              name="service"
              register={register}
              error={errors.service?.message}
              placeholder="Servicio"
              required
              disabled={!client}
            />
          </FormGroup>
          <FormGroup>
            <FormInput
              label="Método de pago"
              name="paymentMethod"
              register={register}
              error={errors.paymentMethod?.message}
              placeholder="Método de pago"
              required
              disabled={!client}
            />
          </FormGroup>
          <FormGroup>
            <FormInput
              label="Referencia"
              name="paymentReference"
              register={register}
              error={errors.paymentReference?.message}
              placeholder="Referencia del pago"
              disabled={!client}
            />
          </FormGroup>
          <FormGroup>
            <FormSelect<"pending" | "paid" | "failed">
              label="Estado del pago"
              name="paymentStatus"
              register={register}
              error={errors.paymentStatus?.message}
              placeholder="Selecciona el estado del pago"
              required
              disabled={!client}
              options={[
                { value: "paid", label: "Pagado" },
                { value: "pending", label: "Pendiente" },
                { value: "failed", label: "Fallido" },
              ]}
              onValueChange={handlePaymentStatusChange}
            />
          </FormGroup>
          <FormGroup>
            <FormSelect<Currency>
              label="Moneda"
              name="currency"
              register={register}
              error={errors.currency?.message}
              placeholder="Selecciona la moneda"
              required
              disabled={!client}
              options={getCurrencyOptions()}
              onValueChange={handlePaymentCurrencyChange}
            />
          </FormGroup>
          <FormGroup>
            <DateInput
              label="Fecha de vencimiento"
              name="expiredDate"
              register={register}
              error={errors.expiredDate?.message}
              onAdjustDate={adjustExpiredDate}
              required
              disabled={!client}
            />
          </FormGroup>
          <FormGroup className="col-span-2 flex justify-end">
            <Button disabled={!client || createPaymentMutation.isPending} type="submit">
              {createPaymentMutation.isPending ? <Loader2 className="animate-spin" /> : "Registrar pago"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
