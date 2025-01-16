import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { FormGroup, FormLabel, FormLabelError } from "@/components/FormGroup";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Client } from "@/lib/types";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createClientRequest, updateClientRequest } from "@/api/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { isEmailValid } from "@/lib/utils";

interface ClientDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  client?: Client | null;
  onClientUpdated?: (client: Client) => void;
}

const clientSchema = z.object({
  _id: z.string(),
  cedula: z.string().min(3, { message: "La cédula es requerida" }),
  firstname: z.string().min(3, { message: "El nombre es requerido" }),
  lastname: z.string().min(3, { message: "El apellido es requerido" }),
  expiredDate: z.string().min(1, { message: "La fecha de vencimiento es requerida" }),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
});

const initialValues: ClientSchema = {
  _id: "",
  cedula: "",
  firstname: "",
  lastname: "",
  expiredDate: "",
  email: "",
  phone: "",
  address: "",
};

type ClientSchema = z.infer<typeof clientSchema>;

export const ClientUpdateDialog = ({
  isOpen,
  onOpenChange,
  onClientUpdated = (client: Client) => {},
  client,
}: ClientDialogProps) => {
  const [email, setEmail] = useState("");

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ClientSchema>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialValues,
  });

  const handleUpdateClient = (data: ClientSchema) => {
    onClientUpdated({ ...data, _id: client?._id || "" });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
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
    }
  }, [client, setValue]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Registrar nuevo cliente" description="Agrega un nuevo cliente en la base de datos." />
      <ModalBody>
        <form onSubmit={handleSubmit(handleUpdateClient)} className="grid grid-cols-2 gap-4">
          <FormGroup className="flex flex-col gap-2 col-span-2">
            <FormLabel>
              <Label>ID</Label>
            </FormLabel>
            <Input disabled {...register("_id")} />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              <Label>Cedula*</Label>
              {errors.cedula && <FormLabelError>{errors.cedula.message}</FormLabelError>}
            </FormLabel>
            <Input type="number" placeholder="Cedula del cliente" {...register("cedula")} />
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
