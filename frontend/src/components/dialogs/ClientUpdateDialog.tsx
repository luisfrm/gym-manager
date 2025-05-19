import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup } from "@/components/FormGroup";
import { Button } from "../ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateClientRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
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
    defaultValues: {
      cedula: client?.cedula || "",
      firstname: client?.firstname || "",
      lastname: client?.lastname || "",
      expiredDate: client?.expiredDate || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: updateClientRequest,
    onSuccess: (data: Client) => {
      toast.success("Cliente actualizado", {
        description: "El cliente ha sido actualizado exitosamente.",
        duration: 5000,
      });
      onClientUpdated(data);
      handleClose();
    },
    onError: (error: AxiosError) => {
      toast.error("Error al actualizar el cliente", {
        description: "Por favor, intenta de nuevo o contacta con el administrador.",
        duration: 5000,
      });
    },
  });

  const handleClose = () => {
    reset();
    setEmail("");
    onOpenChange();
  };

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
    if (client) {
      setValue("cedula", client.cedula);
      setValue("firstname", client.firstname);
      setValue("lastname", client.lastname);
      setValue("expiredDate", client.expiredDate || "");
      setValue("email", client.email);
      setValue("phone", client.phone);
      setValue("address", client.address);
      setValue("_id", client._id);
      setEmail(client.email || "");
    }
  }, [client, setValue]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose}>
      <ModalHeader title="Actualizar cliente" description="Actualiza la información del cliente." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleUpdateClient)} className="grid grid-cols-2 gap-4">
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
          <FormGroup className="col-span-2 flex justify-end">
            <Button disabled={updateClientMutation.isPending} type="submit">
              {updateClientMutation.isPending ? <Loader2 className="animate-spin" /> : "Actualizar"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
