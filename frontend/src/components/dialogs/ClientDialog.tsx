import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/Modal";
import { FormGroup, FormLabel } from "@/components/FormGroup";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Client } from "@/lib/types";
import { useState } from "react";

export const ClientDialog = ({
  isOpen,
  onOpenChange,
  client = null,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}) => {
  const [isModalToUpdate] = useState(client ? true : false);
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Registrar nuevo cliente" description="Agrega un nuevo cliente en la base de datos." />
      <ModalBody>
        <form className="grid grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel>Cedula</FormLabel>
            <Input placeholder="Nombre del cliente" />
          </FormGroup>
          <div></div>
          <FormGroup>
            <FormLabel>Nombre</FormLabel>
            <Input placeholder="Nombre del cliente" />
          </FormGroup>
          <FormGroup>
            <FormLabel>Apellido</FormLabel>
            <Input placeholder="Apellido del cliente" />
          </FormGroup>
          <FormGroup>
            <FormLabel>Email</FormLabel>
            <Input placeholder="Email del cliente" />
          </FormGroup>
          <FormGroup>
            <FormLabel>Telefono</FormLabel>
            <Input placeholder="Telefono del cliente" />
          </FormGroup>
          <FormGroup className="flex flex-col gap-2 col-span-2">
            <FormLabel>Direccion</FormLabel>
            <Input placeholder="Direccion del cliente" />
          </FormGroup>
          <FormGroup className="col-span-2 flex justify-end">
            <Button>Guardar</Button>
          </FormGroup>
        </form>
      </ModalBody>
    </Modal>
  );
};
