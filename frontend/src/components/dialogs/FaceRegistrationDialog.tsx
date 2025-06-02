import { Modal, ModalBody, ModalHeader } from "@/components/Modal";
import { Client } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { registerFace, deleteFaceRegistration } from "@/api/api";
import { toastUtils } from "@/lib/toast";
import { Loader2, Trash2 } from "lucide-react";
import { FaceCaptureComponent } from "./FaceCaptureComponent";
import { Button } from "../ui/button";
import { useState } from "react";

interface FaceRegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  client?: Client | null;
  onFaceRegistered?: () => void;
}

export const FaceRegistrationDialog = ({ isOpen, onOpenChange, client, onFaceRegistered = () => {} }: FaceRegistrationDialogProps) => {
  const [showCapture, setShowCapture] = useState(false);

  const registerFaceMutation = useMutation({
    mutationFn: ({ encoding }: { encoding: number[] }) => {
      if (!client) throw new Error('No client selected');
      return registerFace(client._id, encoding);
    },
    onSuccess: () => {
      onFaceRegistered();
      handleClose();
      const clientName = client ? `${client.firstname} ${client.lastname}` : '';
      if (client?.hasFaceRegistered) {
        toastUtils.face.updated(clientName);
      } else {
        toastUtils.face.registered(clientName);
      }
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

  const deleteFaceMutation = useMutation({
    mutationFn: () => {
      if (!client) throw new Error('No client selected');
      return deleteFaceRegistration(client._id);
    },
    onSuccess: () => {
      onFaceRegistered();
      handleClose();
      const clientName = client ? `${client.firstname} ${client.lastname}` : '';
      toastUtils.face.deleted(clientName);
    },
    onError: (error: any) => {
      console.error('Error deleting face:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Error al eliminar registro facial';
      toastUtils.face.error(errorMessage);
    },
  });

  const handleFaceCaptured = (encoding: number[]) => {
    registerFaceMutation.mutate({ encoding });
  };

  const handleDeleteFace = () => {
    if (confirm('¿Estás seguro de que quieres eliminar el registro facial de este cliente?')) {
      deleteFaceMutation.mutate();
    }
  };

  const handleClose = () => {
    setShowCapture(false);
    // Limpiar cualquier pointer-events pendiente del dropdown
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
    onOpenChange();
  };

  const clientName = client ? `${client.firstname} ${client.lastname}` : '';
  const isUpdating = client?.hasFaceRegistered;

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose}>
      <ModalHeader
        title={isUpdating ? "Actualizar Registro Facial" : "Registrar Rostro"}
        description={`Gestionar el registro facial de ${clientName}`}
      />
      <ModalBody>
        {!showCapture ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              {isUpdating ? (
                <>
                  <p className="text-gray-600">
                    Este cliente ya tiene un registro facial. Puedes actualizarlo o eliminarlo.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setShowCapture(true)}
                      className="w-full sm:w-auto"
                      disabled={registerFaceMutation.isPending}
                    >
                      {registerFaceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Actualizar Registro
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteFace}
                      className="w-full sm:w-auto"
                      disabled={deleteFaceMutation.isPending}
                    >
                      {deleteFaceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Registro
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600">
                    Captura el rostro del cliente para habilitar el acceso por reconocimiento facial.
                  </p>
                  <Button
                    onClick={() => setShowCapture(true)}
                    className="w-full sm:w-auto"
                    disabled={registerFaceMutation.isPending}
                  >
                    {registerFaceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Comenzar Captura
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <FaceCaptureComponent
            isOpen={showCapture}
            onFaceCaptured={handleFaceCaptured}
            onCancel={() => setShowCapture(false)}
            excludeClientId={isUpdating ? client?._id : undefined}
          />
        )}
      </ModalBody>
    </Modal>
  );
}; 