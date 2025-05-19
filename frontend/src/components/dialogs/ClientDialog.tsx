import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup } from "@/components/FormGroup";
import { Button } from "../ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createClientRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleCheckBig, CircleX, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { FormInput } from "../ui/form-input";
import { DateInput } from "../ui/date-input";
import { isEmailValid } from "@/lib/utils";

interface ClientDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClientCreated?: () => void;
}

interface ErrorResponse {
  message: string;
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
    mutationFn: createClientRequest,
    onSuccess: () => {
      onClientCreated();
      reset();
      onOpenChange();

      toast("Cliente creado.", {
        description: "El cliente ha sido creado exitosamente.",
        duration: 5000,
        icon: <CircleCheckBig className="text-lime-500" />,
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error(error);

      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === "Client already exists") {
        toast("Error al crear cliente", {
          description: "Ya existe un cliente con esta cédula.",
          duration: 5000,
          icon: <CircleX className="text-red-600" />,
        });
      } else {
        toast("Error al crear cliente", {
          description: "Por favor, intenta de nuevo o contacta con el administrador.",
          duration: 5000,
          icon: <CircleX className="text-red-600" />,
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
    setValue(field, value);
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
            <Button disabled={createClientMutation.isPending} type="submit">
              {createClientMutation.isPending ? <Loader2 className="animate-spin" /> : "Guardar"}
            </Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
