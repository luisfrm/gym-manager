import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup, FormLabel, FormLabelError } from "@/components/FormGroup";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Client } from "@/lib/types";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createClientRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { isEmailValid } from "@/lib/utils";

interface ClientDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClientCreated?: () => void;
}

const clientSchema = z.object({
  cedula: z.string().min(3, { message: "La cédula es requerida" }),
  firstname: z.string().min(3, { message: "El nombre es requerido" }),
  lastname: z.string().min(3, { message: "El apellido es requerido" }),
  expiredDate: z.string().min(1, { message: "La fecha de vencimiento es requerida" }),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const initialValues: ClientSchema = {
  cedula: "",
  firstname: "",
  lastname: "",
  expiredDate: "",
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
  } = useForm<ClientSchema>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialValues,
  });

  const handleCreateClient = (data: ClientSchema) => {
    const { cedula, firstname, lastname, email, expiredDate, phone, address } = data;
    createClientMutation.mutate({ cedula, firstname, lastname, email, expiredDate, phone, address });
  };

  const createClientMutation = useMutation({
    mutationFn: createClientRequest,
    onSuccess: (data: Client) => {
      console.log(data);
      onClientCreated();
      reset();
      onOpenChange();
    },
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
    console.log("email", isEmailValid(email));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Registrar nuevo cliente" description="Agrega un nuevo cliente en la base de datos." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleCreateClient)} className="grid grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel>
              <Label>Cedula*</Label>
              {errors.cedula && <FormLabelError>{errors.cedula.message}</FormLabelError>}
            </FormLabel>
            <Input type="number" placeholder="Nombre del cliente" {...register("cedula")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Fecha de vencimiento*</Label>
              {errors.expiredDate && <FormLabelError>{errors.expiredDate.message}</FormLabelError>}
            </FormLabel>
            <Input type="date" placeholder="Fecha de vencimiento" {...register("expiredDate")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Nombre*</Label>
              {errors.firstname && <FormLabelError>{errors.firstname.message}</FormLabelError>}
            </FormLabel>
            <Input placeholder="Nombre del cliente" {...register("firstname")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Apellido*</Label>
              {errors.lastname && <FormLabelError>{errors.lastname.message}</FormLabelError>}
            </FormLabel>
            <Input placeholder="Apellido del cliente" {...register("lastname")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Email</Label>
              {!isEmailValid(email) && <FormLabelError>Email no válido</FormLabelError>}
            </FormLabel>
            <Input
              type="email"
              placeholder="Email del cliente"
              {...register("email", {
                onChange: handleEmailChange,
              })}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Telefono</Label>
              {errors.phone && <FormLabelError>{errors.phone.message}</FormLabelError>}
            </FormLabel>
            <Input placeholder="Telefono del cliente" {...register("phone")} />
          </FormGroup>
          <FormGroup className="flex flex-col gap-2 col-span-2">
            <FormLabel>
              <Label>Direccion</Label>
              {errors.address && <FormLabelError>{errors.address.message}</FormLabelError>}
            </FormLabel>
            <Input placeholder="Direccion del cliente" {...register("address")} />
          </FormGroup>
          <FormGroup className="col-span-2 flex justify-end">
            <Button>Guardar</Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
