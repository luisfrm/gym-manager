import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup } from "@/components/FormGroup";
import { Button } from "../ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateClientRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastUtils } from "@/lib/toast";
import { Loader2, User, Mail, Phone, MapPin, CreditCard, Calendar, Edit } from "lucide-react";
import { FormInput } from "../ui/form-input";
import { DateInput } from "../ui/date-input";
import { isEmailValid } from "@/lib/utils";
import { Client } from "@/lib/types";
import { useEffect } from "react";

interface ClientDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  client?: Client | null;
  onClientUpdated?: (client: Client) => void;
}

const clientSchema = z.object({
  _id: z.string(),
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

type ClientSchema = z.infer<typeof clientSchema>;

export const ClientUpdateDialog = ({ isOpen, onOpenChange, client, onClientUpdated = () => {} }: ClientDialogProps) => {
  const [email, setEmail] = useState(client?.email || "");

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClientSchema>({
    resolver: zodResolver(clientSchema),
  });

  const updateClientMutation = useMutation({
    mutationFn: updateClientRequest,
    onSuccess: (data: Client) => {
      const clientName = client ? `${client.firstname} ${client.lastname}` : undefined;
      toastUtils.client.updated(clientName);
      onClientUpdated(data);
      onOpenChange();
    },
    onError: () => {
      toastUtils.client.error('actualizar');
    },
  });

  const currentDate = watch('expiredDate');

  const adjustDate = (months: number) => {
    if (!currentDate) return;
    
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + months);
    setValue('expiredDate', date.toISOString().split('T')[0]);
  };

  const handleUpdateClient = async (data: ClientSchema) => {
    try {
      const updatedClient = {
        ...data,
        _id: client?._id || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      };
      await updateClientMutation.mutateAsync(updatedClient);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

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
    setValue(field, value);
  };

  useEffect(() => {
    if (client && isOpen) {
      reset({
        _id: client._id,
        cedula: client.cedula,
        firstname: client.firstname,
        lastname: client.lastname,
        expiredDate: client.expiredDate || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      });
      setEmail(client.email || "");
    }
  }, [client, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setEmail("");
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Actualizar cliente" description="Actualiza la información del cliente." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleUpdateClient)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TÍTULO CON ÍCONO */}
          <div className="col-span-1 md:col-span-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
              <Edit className="w-5 h-5 text-orange-600" />
              Editar Información del Cliente
            </h3>
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
              icon={<CreditCard className="w-4 h-4" />}
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
          
          <FormGroup>
            <FormInput
              label="Nombre"
              name="firstname"
              register={register}
              error={errors.firstname?.message}
              placeholder="Nombre del cliente"
              required
              onChange={(e) => handleNameChange(e, 'firstname')}
              icon={<User className="w-4 h-4" />}
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
              icon={<User className="w-4 h-4" />}
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
              icon={<Mail className="w-4 h-4" />}
            />
          </FormGroup>
          
          <FormGroup>
            <FormInput
              label="Teléfono"
              name="phone"
              register={register}
              error={errors.phone?.message}
              placeholder="Teléfono del cliente"
              icon={<Phone className="w-4 h-4" />}
            />
          </FormGroup>
          
          <FormGroup className="flex flex-col gap-2 col-span-1 md:col-span-2">
            <FormInput
              label="Dirección"
              name="address"
              register={register}
              error={errors.address?.message}
              placeholder="Dirección del cliente"
              icon={<MapPin className="w-4 h-4" />}
            />
          </FormGroup>
          
          <FormGroup className="col-span-1 md:col-span-2 flex justify-end">
            <Button disabled={updateClientMutation.isPending} type="submit" className="w-full sm:w-auto">
              {updateClientMutation.isPending ? <Loader2 className="animate-spin" /> : "Actualizar"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
