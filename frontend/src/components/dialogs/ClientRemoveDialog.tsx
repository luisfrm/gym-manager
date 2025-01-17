import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { Button } from "../ui/button";
import { Client } from "@/lib/types";

interface ClientDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  client?: Client | null;
  onClientRemoved?: () => void;
}

export const ClientRemoveDialog = ({ isOpen, onOpenChange, onClientRemoved = () => {}, client }: ClientDialogProps) => {
  const handleRemoveClient = () => {
    onClientRemoved();
  };

  return (
    <Modal className="sm:max-w-md" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader
        title={`Remover cliente ${client?.firstname} ${client?.lastname}`}
        description="¿Estás seguro de que deseas eliminar este cliente? Esta operacion no se puede deshacer."
      />
      <ModalBody>
        <div className="flex justify-end gap-2">
          <Button variant="destructive" onClick={handleRemoveClient}>
            Eliminar cliente
          </Button>
          <Button variant="outline" onClick={onOpenChange}>
            Cancelar
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};
