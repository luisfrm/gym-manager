import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createClientWithPaymentRequest } from "@/api/api";
import { Modal, ModalHeader, ModalBody } from "@/components/Modal";
import { Button } from "../ui/button";
import { FormGroup } from "@/components/FormGroup";
import { FormInput } from "../ui/form-input";
import { DateInput } from "../ui/date-input";
import { FormSelect } from "../ui/form-select";
import { toastUtils } from "@/lib/toast";
import { Loader2, Camera, Shield, X } from "lucide-react";
import { isEmailValid } from "@/lib/utils";
import { FaceCaptureComponent } from "./FaceCaptureComponent";
import { Currency, getCurrencyOptions } from "@/lib/currency";

interface ClientWithPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClientAndPaymentCreated?: () => void;
}

// Schema combinado para cliente y pago
const clientWithPaymentSchema = z.object({
  // Datos del cliente
  cedula: z.string()
    .min(3, { message: "La cédula es requerida" })
    .regex(/^\d+$/, { message: "Solo se permiten números" }),
  firstname: z.string()
    .min(3, { message: "El nombre es requerido" })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, { message: "Solo se permiten letras" }),
  lastname: z.string()
    .min(3, { message: "El apellido es requerido" })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, { message: "Solo se permiten letras" }),
  expiredDate: z.string().min(1, { message: "La fecha de expiración es requerida" }),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  
  // Datos del pago
  amount: z.string().min(1, { message: "El monto es requerido" }),
  date: z.string().min(1, { message: "La fecha del pago es requerida" }),
  service: z.string().min(1, { message: "El servicio es requerido" }),
  paymentMethod: z.string().min(1, { message: "El método de pago es requerido" }),
  paymentReference: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]),
  currency: z.enum(["USD", "VES"]),
});

const initialValues: ClientWithPaymentSchema = {
  // Cliente
  cedula: "",
  firstname: "",
  lastname: "",
  expiredDate: new Date().toISOString().split('T')[0],
  email: "",
  phone: "",
  address: "",
  
  // Pago
  amount: "0",
  date: new Date().toISOString().split('T')[0],
  service: "",
  paymentMethod: "",
  paymentReference: "",
  paymentStatus: "paid",
  currency: "USD",
};

type ClientWithPaymentSchema = z.infer<typeof clientWithPaymentSchema>;

export const ClientWithPaymentDialog = ({ isOpen, onOpenChange, onClientAndPaymentCreated = () => {} }: ClientWithPaymentDialogProps) => {
  const [email, setEmail] = useState("");
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [isClosingFaceCapture, setIsClosingFaceCapture] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("paid");
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>("USD");
  const [faceData, setFaceData] = useState<{
    encoding: number[] | null;
    image: string | null;
  }>({
    encoding: null,
    image: null,
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClientWithPaymentSchema>({
    resolver: zodResolver(clientWithPaymentSchema),
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

  const handleCreateClientWithPayment = (data: ClientWithPaymentSchema) => {
    createClientWithPaymentMutation.mutate(data);
  };

  const createClientWithPaymentMutation = useMutation({
    mutationFn: (data: ClientWithPaymentSchema) => {
      const clientData = {
        cedula: data.cedula,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        expiredDate: data.expiredDate,
      };
      
      const paymentData = {
        amount: data.amount,
        date: data.date,
        service: data.service,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        paymentStatus,
        currency: paymentCurrency,
        expiredDate: data.expiredDate,
      };
      
      const faceDataForAPI = faceData.encoding ? 
        { encoding: faceData.encoding, image: faceData.image! } : 
        undefined;
      
      return createClientWithPaymentRequest(clientData, paymentData, faceDataForAPI);
    },
    onSuccess: () => {
      onClientAndPaymentCreated();
      onOpenChange();
      reset();
      setFaceData({ encoding: null, image: null });
      
      toastUtils.combined.clientAndPayment();
    },
    onError: (error: any) => {
      console.error("Error creating client with payment:", error);
      
      // Manejo específico para cara duplicada
      if (error.isDuplicate && error.existingClient) {
        const { firstname, lastname, cedula } = error.existingClient;
        const similarity = error.similarity || 0;
        
        toastUtils.face.duplicate(
          { firstname, lastname, cedula },
          similarity
        );
        return;
      }

      // Manejo de errores existentes
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage === "Client already exists") {
        toastUtils.client.exists();
      } else {
        toastUtils.client.error('crear cliente y pago', errorMessage);
      }
    },
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setValue('cedula', value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'firstname' | 'lastname') => {
    const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setValue(field, capitalizedValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    value = value.replace(/[^\d+-]/g, '');
    const startsWithPlus = value.startsWith('+');
    value = value.replace(/\+/g, '');
    if (startsWithPlus) {
      value = '+' + value;
    }
    
    setValue('phone', value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/^0+/, '');
    if (!value) value = '0';
    e.target.value = value;
    setValue('amount', value);
  };

  const handleAmountBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "0") {
      e.target.value = "0";
      setValue('amount', "0");
      return;
    }
    const formattedValue = Number(value).toFixed(2);
    e.target.value = formattedValue;
    setValue('amount', formattedValue);
  };

  const handlePaymentStatusChange = (value: "pending" | "paid" | "failed") => {
    setPaymentStatus(value);
  };

  const handlePaymentCurrencyChange = (value: Currency) => {
    setPaymentCurrency(value);
  };

  const handleCloseFaceCapture = () => {
    setIsClosingFaceCapture(true);
    setTimeout(() => {
      setShowFaceCapture(false);
      setIsClosingFaceCapture(false);
    }, 700);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="sm:max-w-4xl">
      <ModalHeader title="Registrar cliente con primer pago" description="Crea un nuevo cliente y registra su primer pago en una sola operación." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleCreateClientWithPayment)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* DATOS DEL CLIENTE */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">📋 Datos del Cliente</h3>
          </div>
          
          <FormGroup>
            <FormInput
              label="Cédula"
              name="cedula"
              register={register}
              error={errors.cedula?.message}
              placeholder="Cédula del cliente"
              required
              onChange={handleCedulaChange}
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Nombre"
              name="firstname"
              register={register}
              error={errors.firstname?.message}
              placeholder="Nombre del cliente"
              required
              onChange={(e) => handleNameChange(e, 'firstname')}
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Apellido"
              name="lastname"
              register={register}
              error={errors.lastname?.message}
              placeholder="Apellido del cliente"
              required
              onChange={(e) => handleNameChange(e, 'lastname')}
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Email"
              name="email"
              register={register}
              error={!isEmailValid(email) ? "Email no válido" : undefined}
              placeholder="Email del cliente"
              type="email"
              onChange={handleEmailChange}
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Teléfono"
              name="phone"
              register={register}
              error={errors.phone?.message}
              placeholder="Teléfono del cliente"
              onChange={handlePhoneChange}
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
            />
          </FormGroup>
          
          <FormGroup className="col-span-1 sm:col-span-2 lg:col-span-3">
            <FormInput
              label="Dirección"
              name="address"
              register={register}
              error={errors.address?.message}
              placeholder="Dirección del cliente"
            />
          </FormGroup>

          {/* REGISTRO FACIAL */}
          <FormGroup className="col-span-1 sm:col-span-2 lg:col-span-3">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="text-sm font-medium">Registro Facial (Opcional)</label>
                <div className="flex items-center gap-2">
                  {faceData.encoding ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Rostro capturado</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFaceData({ encoding: null, image: null })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowFaceCapture(true)}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Camera className="w-4 h-4" />
                      Capturar rostro
                    </Button>
                  )}
                </div>
              </div>
              
              {faceData.image && (
                <div className="flex justify-center">
                  <img
                    src={faceData.image}
                    alt="Rostro capturado"
                    className="w-32 h-24 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </FormGroup>

          {/* Componente de captura facial */}
          {showFaceCapture && (
            <FormGroup className="col-span-1 sm:col-span-2 lg:col-span-3">
              <div 
                className={`transition-all duration-700 ease-in-out overflow-hidden ${
                  isClosingFaceCapture 
                    ? "max-h-0 opacity-0 transform scale-95 -translate-y-4" 
                    : "max-h-[600px] opacity-100 transform scale-100 translate-y-0"
                }`}
                style={{
                  transitionProperty: 'max-height, opacity, transform',
                  transitionTimingFunction: isClosingFaceCapture 
                    ? 'cubic-bezier(0.4, 0, 1, 1)' 
                    : 'cubic-bezier(0, 0, 0.2, 1)'
                }}
              >
                <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm transition-all duration-700 ${
                  isClosingFaceCapture 
                    ? 'shadow-none border-transparent' 
                    : 'shadow-sm border-blue-200'
                }`}>
                  <FaceCaptureComponent
                    isOpen={showFaceCapture}
                    onFaceCaptured={(encoding, image) => {
                      setFaceData({ encoding, image });
                      handleCloseFaceCapture();
                    }}
                    onCancel={handleCloseFaceCapture}
                  />
                </div>
              </div>
            </FormGroup>
          )}

          {/* DATOS DEL PAGO */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">💳 Datos del Primer Pago</h3>
          </div>
          
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
            />
          </FormGroup>
          
          <FormGroup>
            <DateInput
              label="Fecha del pago"
              name="date"
              register={register}
              error={errors.date?.message}
              onAdjustDate={adjustDate}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Servicio"
              name="service"
              register={register}
              error={errors.service?.message}
              placeholder="Tipo de servicio"
              required
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
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Referencia"
              name="paymentReference"
              register={register}
              error={errors.paymentReference?.message}
              placeholder="Referencia del pago"
            />
          </FormGroup>
          
          <FormGroup>
            <FormSelect<"pending" | "paid" | "failed">
              label="Estado del pago"
              name="paymentStatus"
              register={register}
              error={errors.paymentStatus?.message}
              placeholder="Selecciona el estado"
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
            <FormSelect<Currency>
              label="Moneda"
              name="currency"
              register={register}
              error={errors.currency?.message}
              placeholder="Selecciona la moneda"
              required
              options={getCurrencyOptions()}
              onValueChange={handlePaymentCurrencyChange}
            />
          </FormGroup>
          
          <FormGroup className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-end mt-6">
            <Button disabled={createClientWithPaymentMutation.isPending} type="submit" className="w-full sm:w-auto px-8">
              {createClientWithPaymentMutation.isPending ? <Loader2 className="animate-spin" /> : "Crear Cliente y Pago"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
}; 