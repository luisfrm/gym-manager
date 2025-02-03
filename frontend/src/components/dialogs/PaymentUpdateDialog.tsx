import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup, FormLabel, FormLabelError } from "@/components/FormGroup";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Payment } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { updatePartialPaymentRequest, updatePaymentStatusRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { CheckCircle, CircleCheck, CircleX, Loader2, OctagonAlert, OctagonX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useStore } from "@/hooks/useStore";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onPaymentUpdated?: () => void;
  payment: Payment;
}

const paymentSchema = z.object({
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

export const PaymentUpdateDialog = ({
  isOpen,
  onOpenChange,
  onPaymentUpdated = () => {},
  payment,
}: PaymentDialogProps) => {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [paymentCurrency, setPaymentCurrency] = useState<"USD" | "VES">("USD");
  const isAdmin = useStore(state => state?.auth?.user?.role === "admin");

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

  const handleUpdatePayment = (data: PaymentSchema) => {
    const { amount, date, service, paymentMethod, paymentReference, expiredDate } = data;

    let paymentData = {};

    if (isAdmin) {
      paymentData = {
        _id: payment._id,
        amount: Number(amount),
        date,
        service,
        paymentMethod,
        paymentReference,
        paymentStatus,
        currency: paymentCurrency,
        expiredDate,
      };
    } else {
      paymentData = {
        _id: payment._id,
        paymentStatus,
      };
    }

    updatePartialPaymentMutation.mutate(paymentData);
  };

  const updatePartialPaymentMutation = useMutation({
    mutationFn: isAdmin ? updatePartialPaymentRequest : updatePaymentStatusRequest,
    onSuccess: () => {
      onPaymentUpdated();
      resetPaymentForm();
      onOpenChange();
      toast("Pago actualizado.", {
        description: "Por favor, intenta de nuevo o contacta con el administrador.",
        duration: 5000,
        icon: <CircleCheck className="text-lime-500" />,
      });
    },
    onError: (error: AxiosError) => {
      console.error(error);

      toast("Error al actualizar el pago.", {
        description: `${error?.response?.status === 401 ? "No tienes acceso a este recurso. Contacta con el administrador." : "Por favor, intenta de nuevo o contacta con el administrador."}`,
        duration: 5000,
        icon: <CircleX className="text-red-600" />,
      });
    },
  });

  const handlePaymentStatusChange = (value: "pending" | "paid" | "failed") => {
    setPaymentStatus(value);
  };

  const handlePaymentCurrencyChange = (value: "USD" | "VES") => {
    setPaymentCurrency(value);
  };

  useEffect(() => {
    if (!isOpen) {
      resetPaymentForm();
    }

    if (payment && payment.client) {
      setValue("amount", Number(payment.amount || 0).toFixed(2));
      setValue("date", payment.date || "");
      setValue("service", payment.service || "");
      setValue("paymentMethod", payment.paymentMethod || "");
      setValue("paymentReference", payment.paymentReference ?? "");
      setValue("expiredDate", payment.client.expiredDate || "");

      setPaymentCurrency(payment.currency || "");
      setPaymentStatus(payment.paymentStatus || "");
    }
  }, [isOpen, resetPaymentForm, payment, setValue]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Actualizar pago" description="Actualiza un pago existente en la base de datos." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleUpdatePayment)} className="grid grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel>
              <Label>Nombre</Label>
            </FormLabel>
            <Input
              value={`${payment.client.firstname} ${payment.client.lastname}`}
              type="text"
              placeholder="Nombre del cliente"
              disabled
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Cedula del cliente</Label>
            </FormLabel>
            <Input value={payment.clientCedula} type="text" placeholder="Cedula del cliente" disabled />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Monto*</Label>
              {paymentErrors.amount && <FormLabelError>{paymentErrors.amount.message}</FormLabelError>}
            </FormLabel>
            <Input
              type="number"
              placeholder="Ingresa el monto del pago"
              disabled={!isAdmin}
              {...register("amount", {
                onBlur: e => {
                  const value = e.target.value;
                  const formattedValue =
                    Number(value) >= 0 ? Number(value).toFixed(2) : (Number(value) * -1).toFixed(2);

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
            <Input disabled={!isAdmin} type="date" placeholder="Ingresa la fecha del pago" {...register("date")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Servicio*</Label>
              {paymentErrors.service && <FormLabelError>{paymentErrors.service.message}</FormLabelError>}
            </FormLabel>
            <Input
              disabled={!isAdmin}
              type="text"
              placeholder="Ingresa el servicio del pago"
              {...register("service")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Método de pago*</Label>
              {paymentErrors.paymentMethod && <FormLabelError>{paymentErrors.paymentMethod.message}</FormLabelError>}
            </FormLabel>
            <Input
              disabled={!isAdmin}
              type="text"
              placeholder="Ingresa el método de pago"
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
              disabled={!isAdmin}
              type="text"
              placeholder="Ingresa la referencia del pago"
              {...register("paymentReference")}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Estado del pago*</Label>
              {paymentErrors.paymentStatus && <FormLabelError>{paymentErrors.paymentStatus.message}</FormLabelError>}
            </FormLabel>
            <Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
              <SelectTrigger>
                <SelectValue defaultValue={paymentStatus} placeholder="Selecciona el estado del pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">
                  <div className="flex gap-1 items-center">
                    <CheckCircle className="text-lime-500 h-4 w-4" /> Pagado
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex gap-1 items-center">
                    <OctagonAlert className="text-yellow-500 h-4 w-4" /> Pendiente
                  </div>
                </SelectItem>
                <SelectItem value="failed">
                  <div className="flex gap-1 items-center">
                    <OctagonX className="text-red-500 h-4 w-4" /> Fallido
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Moneda*</Label>
              {paymentErrors.currency && <FormLabelError>{paymentErrors.currency.message}</FormLabelError>}
            </FormLabel>
            <Select disabled={!isAdmin} value={paymentCurrency} onValueChange={handlePaymentCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la moneda" />
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
            <Input disabled={!isAdmin} type="date" placeholder="Fecha de vencimiento" {...register("expiredDate")} />
          </FormGroup>
          <FormGroup className="col-span-2 flex justify-end">
            <Button type="submit" disabled={updatePartialPaymentMutation.isPending}>
              {updatePartialPaymentMutation.isPending ? <Loader2 className="animate-spin" /> : "Actualizar pago"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
