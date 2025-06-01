import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createClientRequest } from "@/api/api";
import { Modal, ModalHeader, ModalBody } from "@/components/Modal";
import { Button } from "../ui/button";
import { FormGroup } from "@/components/FormGroup";
import { FormInput } from "../ui/form-input";
import { DateInput } from "../ui/date-input";
import { toast } from "sonner";
import { Loader2, CircleX, Camera, Shield, X, CircleCheckBig } from "lucide-react";
import { isEmailValid } from "@/lib/utils";
import { FaceCaptureComponent } from "./FaceCaptureComponent";

interface ClientDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClientCreated?: () => void;
}

const clientSchema = z.object({
  cedula: z.string()
    .min(3, { message: "La cédula es requerida" })
    .regex(/^\d+$/, { message: "Solo se permiten números" }),
  firstname: z.string()
    .min(3, { message: "El nombre es requerido" })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, { message: "Solo se permiten letras" }),
  lastname: z.string()
    .min(3, { message: "El apellido es requerido" })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, { message: "Solo se permiten letras" }),
  expiredDate: z.string().min(1, { message: "La fecha es requerida" }),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const initialValues: ClientSchema = {
  cedula: "",
  firstname: "",
  lastname: "",
  expiredDate: new Date().toISOString().split('T')[0],
  email: "",
  phone: "",
  address: "",
};

type ClientSchema = z.infer<typeof clientSchema>;

export const ClientDialog = ({ isOpen, onOpenChange, onClientCreated = () => {} }: ClientDialogProps) => {
  const [email, setEmail] = useState("");
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [isClosingFaceCapture, setIsClosingFaceCapture] = useState(false);
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
  } = useForm<ClientSchema>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialValues,
  });

  const currentDate = watch('expiredDate');

  const adjustDate = (months: number) => {
    if (!currentDate) return;
    
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + months);
    setValue('expiredDate', date.toISOString().split('T')[0]);
  };

  const handleCreateClient = (data: ClientSchema) => {
    const { cedula, firstname, lastname, email, expiredDate, phone, address } = data;
    createClientMutation.mutate({ cedula, firstname, lastname, email, expiredDate, phone, address });
  };

  const createClientMutation = useMutation({
    mutationFn: (data: ClientSchema) => {
      const requestData = {
        ...data,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      };
      
      // Agregar datos faciales si existen
      const faceDataForAPI = faceData.encoding ? 
        { encoding: faceData.encoding, image: faceData.image! } : 
        undefined;
      
      return createClientRequest(requestData, faceDataForAPI);
    },
    onSuccess: () => {
      onClientCreated();
      onOpenChange();
      reset();
      setFaceData({ encoding: null, image: null });
      
      toast("Cliente creado exitosamente", {
        description: "El cliente ha sido registrado en la base de datos.",
        duration: 4000,
        icon: <CircleCheckBig className="w-6 h-6 text-green-500" />,
        style: {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          color: '#16A34A'
        }
      });
    },
    onError: (error: any) => {
      console.error("Error creating client:", error);
      
      // ✅ MANEJO ESPECÍFICO PARA CARA DUPLICADA
      if (error.isDuplicate && error.existingClient) {
        const { firstname, lastname, cedula } = error.existingClient;
        const similarity = Math.round((error.similarity || 0) * 100);
        
        toast("Cara ya registrada", {
          description: `Esta cara pertenece a ${firstname} ${lastname} (${cedula}) - Similitud: ${similarity}%`,
          duration: 8000,
          icon: <CircleX className="w-6 h-6 text-red-500" />,
          style: {
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#DC2626'
          }
        });
        return;
      }

      // Manejo de errores existentes
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage === "Client already exists") {
        toast("Error al crear cliente", {
          description: "Ya existe un cliente con esta cédula.",
          duration: 5000,
          icon: <CircleX className="w-6 h-6 text-red-500" />,
          style: {
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#DC2626'
          }
        });
      } else {
        toast("Error al crear cliente", {
          description: errorMessage || "Por favor, intenta de nuevo o contacta con el administrador.",
          duration: 5000,
          icon: <CircleX className="w-6 h-6 text-red-500" />,
          style: {
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#DC2626'
          }
        });
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
    
    // Permitir solo dígitos, + y -
    value = value.replace(/[^\d+-]/g, '');
    
    // Verificar si empieza con +
    const startsWithPlus = value.startsWith('+');
    
    // Remover todos los +
    value = value.replace(/\+/g, '');
    
    // Si originalmente empezaba con +, agregarlo al inicio
    if (startsWithPlus) {
      value = '+' + value;
    }
    
    setValue('phone', value);
  };

  const handleCloseFaceCapture = () => {
    setIsClosingFaceCapture(true);
    setTimeout(() => {
      setShowFaceCapture(false);
      setIsClosingFaceCapture(false);
    }, 700); // Duración sincronizada con la animación
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Registrar nuevo cliente" description="Agrega un nuevo cliente en la base de datos." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleCreateClient)} className="grid grid-cols-2 gap-4">
          <FormGroup>
            <FormInput
              label="Cedula"
              name="cedula"
              register={register}
              error={errors.cedula?.message}
              placeholder="Cédula del cliente"
              required
              onChange={handleCedulaChange}
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
              label="Telefono"
              name="phone"
              register={register}
              error={errors.phone?.message}
              placeholder="Telefono del cliente"
              onChange={handlePhoneChange}
            />
          </FormGroup>
          <FormGroup className="flex flex-col gap-2 col-span-2">
            <FormInput
              label="Direccion"
              name="address"
              register={register}
              error={errors.address?.message}
              placeholder="Direccion del cliente"
            />
          </FormGroup>
          
          {/* Sección de Registro Facial */}
          <FormGroup className="col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
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
                      className="flex items-center gap-2"
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
            <FormGroup className="col-span-2">
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
          
          <FormGroup className="col-span-2 flex justify-end">
            <Button disabled={createClientMutation.isPending} type="submit">
              {createClientMutation.isPending ? <Loader2 className="animate-spin" /> : "Guardar"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
