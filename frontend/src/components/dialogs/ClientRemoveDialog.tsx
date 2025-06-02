import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { deleteClientRequest } from "@/api/api";
import { toastUtils } from "@/lib/toast";
import { Loader2 } from "lucide-react";

interface ClientRemoveDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  client?: Client | null;
  onClientDeleted?: () => void;
}

export const ClientRemoveDialog = ({ isOpen, onOpenChange, client, onClientDeleted = () => {} }: ClientRemoveDialogProps) => {

  const deleteClientMutation = useMutation({
    mutationFn: deleteClientRequest,
    onSuccess: () => {
      const clientName = client ? `${client.firstname} ${client.lastname}` : undefined;
      toastUtils.client.deleted(clientName);
      onClientDeleted();
      onOpenChange();
    },
    onError: (error: any) => {
      console.error('Error deleting client:', error);
      
      const errorMessage = error?.response?.data?.message;
      
      if (errorMessage === "No se puede eliminar el cliente porque tiene pagos asociados") {
        toastUtils.client.error('eliminar', "No se puede eliminar el cliente porque tiene pagos asociados");
      } else if (errorMessage) {
        toastUtils.client.error('eliminar', errorMessage);
      } else {
        toastUtils.client.error('eliminar');
      }
    },
  });

  const handleDelete = async () => {
    if (!client) {
      toastUtils.error('Error', { description: 'No se ha seleccionado ningún cliente para eliminar' });
      return;
    }
    
    deleteClientMutation.mutate({ _id: client._id });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title="Eliminar cliente" description={`¿Estás seguro de que quieres eliminar a ${client?.firstname} ${client?.lastname}?`} />
      <ModalBody>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onOpenChange} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteClientMutation.isPending}
            className="w-full sm:w-auto"
          >
            {deleteClientMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};
