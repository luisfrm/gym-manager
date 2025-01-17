import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup, FormLabel, FormLabelError } from "@/components/FormGroup";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Client } from "@/lib/types";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPaymentRequest, getClientByIdRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { CheckCircle, Loader2, OctagonX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onPaymentCreated?: () => void;
}

const paymentSchema = z.object({
  client: z.string().min(1, { message: "El cliente es requerido" }),
  clientCedula: z.string().min(1, { message: "La cédula del cliente es requerida" }),
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
  amount: "0",
  date: "",
  service: "",
  paymentMethod: "",
  paymentReference: "",
  paymentStatus: "pending",
  expiredDate: "",
  currency: "USD",
};

type PaymentSchema = z.infer<typeof paymentSchema>;

export const PaymentDialog = ({ isOpen, onOpenChange, onPaymentCreated = () => {} }: PaymentDialogProps) => {
  const [cedula, setCedula] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [paymentCurrency, setPaymentCurrency] = useState<"USD" | "VES">("USD");

  const {
    handleSubmit,
    register,
    formState: { errors: paymentErrors },
    reset: resetPaymentForm,
    setValue,
  } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialValues,
  });

  const {
    data: client,
    isLoading: isLoadingClient,
    isError: isErrorClient,
    error: clientError,
  } = useQuery<Client, AxiosError>({
    queryKey: ["client", cedula],
    queryFn: () => getClientByIdRequest(cedula),
    enabled: !!cedula,
  });

  useEffect(() => {
    if (client) {
      setValue("client", client._id);
      setValue("clientCedula", client.cedula);
    }
  }, [client, setValue]);

  useEffect(() => {
    if (isErrorClient) {
      toast.error("Error al buscar el cliente");
    }
  }, [isErrorClient, clientError]);

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
      resetPaymentForm();
      onOpenChange();
      toast.success("Pago registrado correctamente");
      setCedula("");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error(error?.response?.data);
      toast.error("Error al registrar el pago");
    },
  });

  const handleSearchClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = e.target as HTMLFormElement;
    const cedula = (formData.querySelector("#payment-cedula") as HTMLInputElement).value;
    setCedula(cedula);
  };

  const handlePaymentStatusChange = (value: "pending" | "paid" | "failed") => {
    setPaymentStatus(value);
  };

  const handlePaymentCurrencyChange = (value: "USD" | "VES") => {
    setPaymentCurrency(value);
  };

  useEffect(() => {
    if (!isOpen) {
      setCedula("");
      resetPaymentForm();
    }
  }, [isOpen, resetPaymentForm]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Registrar nuevo pago" description="Agrega un nuevo pago en la base de datos." />
      <ModalBody>
        <form className="flex gap-4 items-end" onSubmit={handleSearchClient}>
          <FormGroup className="flex flex-col gap-2 flex-1">
            <FormLabel>
              <Label>Cedula*</Label>
            </FormLabel>
            <Input type="number" placeholder="Ingresa la cédula del cliente" id="payment-cedula" />
          </FormGroup>
          <FormGroup className="flex items-end">
            <Button type="submit">
              {isLoadingClient ? <Loader2 className="animate-spin text-white" /> : "Buscar"}
            </Button>
          </FormGroup>
        </form>
        <div className="flex gap-2">
          <p className="text-sm">
            <strong>Nombre:</strong> {client?.firstname} {client?.lastname}
          </p>
          {isErrorClient && clientError.response?.status === 404 ? (
            <p className="text-red-500 text-sm">Cliente no fue encontrado</p>
          ) : null}
          {client ? <CheckCircle className="text-green-500" /> : <OctagonX className="animate-bounce text-red-500" />}
        </div>
        <form onSubmit={handleSubmit(handleCreatePayment)} className="grid grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel>
              <Label>Monto*</Label>
              {paymentErrors.amount && <FormLabelError>{paymentErrors.amount.message}</FormLabelError>}
            </FormLabel>
            <Input
              disabled={!client}
              type="number"
              placeholder="Ingresa el monto del pago"
              {...register("amount", {
                onBlur: e => {
                  const value = e.target.value;
                  const formattedValue = Number(value).toFixed(2);
                  e.target.value = formattedValue;
                },
              })}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Fecha*</Label>
              {paymentErrors.date && <FormLabelError>{paymentErrors.date.message}</FormLabelError>}
            </FormLabel>
            <Input type="date" placeholder="Ingresa la fecha del pago" disabled={!client} {...register("date")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Servicio*</Label>
              {paymentErrors.service && <FormLabelError>{paymentErrors.service.message}</FormLabelError>}
            </FormLabel>
            <Input type="text" placeholder="Ingresa el servicio del pago" disabled={!client} {...register("service")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Método de pago*</Label>
              {paymentErrors.paymentMethod && <FormLabelError>{paymentErrors.paymentMethod.message}</FormLabelError>}
            </FormLabel>
            <Input
              type="text"
              placeholder="Ingresa el método de pago"
              disabled={!client}
              {...register("paymentMethod")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Referencia*</Label>
              {paymentErrors.paymentReference && (
                <FormLabelError>{paymentErrors.paymentReference.message}</FormLabelError>
              )}
            </FormLabel>
            <Input
              type="text"
              placeholder="Ingresa la referencia del pago"
              disabled={!client}
              {...register("paymentReference")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Estado del pago*</Label>
              {paymentErrors.paymentStatus && <FormLabelError>{paymentErrors.paymentStatus.message}</FormLabelError>}
            </FormLabel>
            <Select disabled={!client} onValueChange={handlePaymentStatusChange}>
              <SelectTrigger>
                <SelectValue defaultValue={paymentStatus} placeholder="Selecciona el estado del pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Moneda*</Label>
              {paymentErrors.currency && <FormLabelError>{paymentErrors.currency.message}</FormLabelError>}
            </FormLabel>
            <Select disabled={!client} onValueChange={handlePaymentCurrencyChange}>
              <SelectTrigger>
                <SelectValue defaultValue={paymentCurrency} placeholder="Selecciona la moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="VES">VES</SelectItem>
              </SelectContent>
            </Select>
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Fecha de vencimiento*</Label>
              {paymentErrors.expiredDate && <FormLabelError>{paymentErrors.expiredDate.message}</FormLabelError>}
            </FormLabel>
            <Input type="date" placeholder="Fecha de vencimiento" {...register("expiredDate")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Id del cliente</Label>
            </FormLabel>
            <Input type="text" placeholder="Id del cliente" disabled {...register("client")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Cedula del cliente</Label>
            </FormLabel>
            <Input type="text" placeholder="Cedula del cliente" disabled {...register("clientCedula")} />
          </FormGroup>
          <FormGroup className="col-span-2 flex justify-end">
            <Button type="submit">Registrar pago</Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
