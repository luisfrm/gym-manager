import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup } from "@/components/FormGroup";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { updatePartialPaymentRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastUtils } from "@/lib/toast";
import { Loader2, DollarSign, Calendar, CreditCard, FileText, Hash, Edit } from "lucide-react";
import { FormInput } from "../ui/form-input";
import { DateInput } from "../ui/date-input";
import { FormSelect } from "../ui/form-select";
import { Client, Payment } from "@/lib/types";
import React from "react";

interface PaymentUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  payment?: Payment | null;
  onPaymentUpdated?: () => void;
}

const paymentSchema = z.object({
  _id: z.string(),
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

type PaymentSchema = z.infer<typeof paymentSchema>;

export const PaymentUpdateDialog = ({ isOpen, onOpenChange, payment, onPaymentUpdated = () => {} }: PaymentUpdateDialogProps) => {
  
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
  });

  const currentDate = watch('date');

  // Actualizar los valores del formulario cuando cambie el payment
  React.useEffect(() => {
    if (payment && isOpen) {
      reset({
        _id: payment._id || "",
        client: payment.client._id || "",
        clientCedula: payment.clientCedula || "",
        clientName: payment.client ? `${payment.client.firstname} ${payment.client.lastname}` : "",
        amount: payment.amount ? payment.amount.toString() : "",
        date: payment.date || "",
        service: payment.service || "",
        description: payment.description || "",
        paymentMethod: payment.paymentMethod || "",
        paymentReference: payment.paymentReference || "",
        paymentStatus: payment.paymentStatus || "pending",
        currency: payment.currency || "USD",
        expiredDate: payment.client?.expiredDate || "",
      });
    }
  }, [payment, isOpen, reset]);

  const adjustDate = (months: number) => {
    if (!currentDate) return;
    
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + months);
    setValue('date', date.toISOString().split('T')[0]);
  };

  const updatePartialPaymentMutation = useMutation({
    mutationFn: updatePartialPaymentRequest,
    onSuccess: () => {
      onPaymentUpdated();
      reset();
      onOpenChange();
      toastUtils.payment.updated();
    },
    onError: (error: any) => {
      if (error?.response?.data?.errors) {
        const refError = error.response.data.errors.find((e: any) => e.field === "paymentReference");
        if (refError) {
          toastUtils.payment.referenceError(refError.message);
          return;
        }
      }
      toastUtils.payment.error('actualizar');
    },
  });

  const handleUpdatePayment = async (data: PaymentSchema) => {
    try {
      await updatePartialPaymentMutation.mutateAsync({
        _id: data._id,
        client: data.client as unknown as Client,
        amount: Number(data.amount),
        date: data.date,
        service: data.service,
        description: data.description,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        paymentStatus: data.paymentStatus,
        currency: data.currency,
        expiredDate: data.expiredDate,
      });
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const handlePaymentStatusChange = (value: "pending" | "paid" | "failed") => {
    setValue('paymentStatus', value);
  };

  const handlePaymentCurrencyChange = (value: "USD" | "VES") => {
    setValue('currency', value);
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
      <ModalHeader title="Actualizar pago" description="Actualiza la información del pago." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleUpdatePayment)} className="grid grid-cols-2 gap-4">
          
          {/* TÍTULO CON ÍCONO */}
          <div className="col-span-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
              <Edit className="w-5 h-5 text-orange-600" />
              Editar Información del Pago
            </h3>
          </div>

          <FormGroup>
            <FormInput
              label="Monto"
              name="amount"
              register={register}
              error={errors.amount?.message}
              placeholder="Monto del pago"
              required
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              icon={<DollarSign className="w-4 h-4" />}
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
              icon={<Calendar className="w-4 h-4" />}
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
              icon={<FileText className="w-4 h-4" />}
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
              icon={<CreditCard className="w-4 h-4" />}
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Referencia"
              name="paymentReference"
              register={register}
              error={errors.paymentReference?.message}
              placeholder="Referencia del pago"
              icon={<Hash className="w-4 h-4" />}
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
              options={[
                { value: "paid", label: "Pagado" },
                { value: "pending", label: "Pendiente" },
                { value: "failed", label: "Fallido" },
              ]}
              onValueChange={handlePaymentStatusChange}
            />
          </FormGroup>
          
          <FormGroup>
            <FormSelect<"USD" | "VES">
              label="Moneda"
              name="currency"
              register={register}
              error={errors.currency?.message}
              placeholder="Selecciona la moneda"
              required
              options={[
                { value: "USD", label: "USD" },
                { value: "VES", label: "VES" },
              ]}
              onValueChange={handlePaymentCurrencyChange}
            />
          </FormGroup>
          
          <FormGroup>
            <DateInput
              label="Fecha de vencimiento"
              name="expiredDate"
              register={register}
              error={errors.expiredDate?.message}
              onAdjustDate={adjustDate}
              required
              icon={<Calendar className="w-4 h-4" />}
            />
          </FormGroup>
          
          <FormGroup className="col-span-2 flex justify-end">
            <Button disabled={updatePartialPaymentMutation.isPending} type="submit">
              {updatePartialPaymentMutation.isPending ? <Loader2 className="animate-spin" /> : "Actualizar pago"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
