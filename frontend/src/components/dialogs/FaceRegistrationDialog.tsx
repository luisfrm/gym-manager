import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { Client } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { registerFace } from "@/api/api";
import { toastUtils } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import { FaceCaptureComponent } from "./FaceCaptureComponent";

interface FaceRegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  client?: Client | null;
  onFaceRegistered?: () => void;
}

export const FaceRegistrationDialog = ({ isOpen, onOpenChange, client, onFaceRegistered = () => {} }: FaceRegistrationDialogProps) => {

  const registerFaceMutation = useMutation({
    mutationFn: ({ encoding }: { encoding: number[] }) => {
      if (!client) throw new Error('No client selected');
      return registerFace(client._id, encoding);
    },
    onSuccess: () => {
      onFaceRegistered();
      onOpenChange();
      const clientName = client ? `${client.firstname} ${client.lastname}` : '';
      toastUtils.face.registered(clientName);
    },
    onError: (error: any) => {
      console.error('Error registering face:', error);
      
      const errorData = error?.response?.data;
      
      if (error?.response?.status === 409) {
        // Cara duplicada
        if (errorData?.existingClient) {
          const { firstname, lastname, cedula } = errorData.existingClient;
          const similarity = errorData.similarity;
          toastUtils.face.duplicate(
            { firstname, lastname, cedula },
            similarity
          );
        } else {
          toastUtils.face.duplicate();
        }
      } else {
        const errorMessage = errorData?.message || error.message || 'Error al registrar rostro';
        toastUtils.face.error(errorMessage);
      }
    },
  });

  const handleFaceCaptured = (encoding: number[]) => {
    registerFaceMutation.mutate({ encoding });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader 
        title="Registro Facial" 
        description={`Registrar rostro para ${client?.firstname} ${client?.lastname}`} 
      />
      <ModalBody>
        <FaceCaptureComponent
          isOpen={isOpen}
          onFaceCaptured={handleFaceCaptured}
          onCancel={onOpenChange}
        />
        
        {registerFaceMutation.isPending && (
          <div className="flex items-center justify-center gap-2 mt-4 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Registrando rostro...</span>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}; 