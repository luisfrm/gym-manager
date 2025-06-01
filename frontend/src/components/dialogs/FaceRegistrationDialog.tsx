import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FaceCaptureComponent } from "./FaceCaptureComponent";
import { registerFace } from "@/api/api";
import { toast } from "sonner";
import { CircleCheckBig, CircleX } from "lucide-react";

interface FaceRegistrationDialogProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FaceRegistrationDialog = ({
  clientId,
  clientName,
  isOpen,
  onClose,
  onSuccess,
}: FaceRegistrationDialogProps) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleFaceCaptured = async (encoding: number[], image: string) => {
    try {
      setIsRegistering(true);
      
      await registerFace(clientId, encoding, image);
      
      toast("Registro facial exitoso", {
        description: `El rostro de ${clientName} ha sido registrado correctamente`,
        duration: 4000,
        icon: <CircleCheckBig className="w-6 h-6 text-green-500" />,
        style: {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          color: '#16A34A'
        }
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error registering face:", error);
      
      // Manejo específico de error 409 (cara duplicada)
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        if (errorData.existingClient) {
          const { firstname, lastname, cedula } = errorData.existingClient;
          const similarity = Math.round((errorData.similarity || 0) * 100);
          
          toast("Cara ya registrada", {
            description: `Esta cara pertenece a ${firstname} ${lastname} (${cedula}) - Similitud: ${similarity}%`,
            duration: 8000,
            icon: <CircleX className="w-6 h-6 text-red-500" />,
            style: {
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
              color: '#DC2626'
            }
          });
        } else {
          toast("Cara ya registrada", {
            description: "Esta cara ya está registrada en el sistema",
            duration: 5000,
            icon: <CircleX className="w-6 h-6 text-red-500" />,
            style: {
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
              color: '#DC2626'
            }
          });
        }
      } else {
        // Otros errores
        toast("Error en el registro", {
          description: error.response?.data?.message || "Error al registrar el rostro",
          duration: 5000,
          icon: <CircleX className="w-6 h-6 text-red-500" />,
          style: {
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#DC2626'
          }
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Rostro - {clientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isRegistering ? (
            <FaceCaptureComponent
              onFaceCaptured={handleFaceCaptured}
              onCancel={onClose}
              isOpen={isOpen}
            />
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Registrando rostro...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 