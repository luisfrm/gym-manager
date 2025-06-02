import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar, Camera, Shield } from "lucide-react";
import formatNumber from "@/lib/formatNumber";
import { isDateActive } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Client } from "@/lib/types";
import { Button } from "./ui/button";
import { useState } from "react";
import { FaceRegistrationDialog } from "./dialogs/FaceRegistrationDialog";

interface ClientCardProps {
  client: Client;
  onEdit?: () => void;
  onDelete?: () => void;
  onClientUpdated?: () => void;
}

export function ClientCard({ client, onClientUpdated }: ClientCardProps) {
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);

  const handleFaceRegistration = () => {
    setShowFaceRegistration(true);
  };

  return (
    <Card className="w-full mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link to={`/clients/${client.cedula}`}>
              <h2 className="text-2xl font-bold">{`${client.firstname} ${client.lastname}`}</h2>
            </Link>
            <p className="text-sm text-muted-foreground font-bold">Cédula: {formatNumber(client.cedula)}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge
              variant="default"
              className={`text-white ${isDateActive(client.expiredDate) ? "bg-green-500" : "bg-red-500"}`}
            >
              {isDateActive(client.expiredDate) ? "Activo" : "Inactivo"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFaceRegistration}
              title={client.hasFaceRegistered ? "Actualizar registro facial" : "Registrar cara"}
            >
              {client.hasFaceRegistered ? (
                <>
                  <Shield className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs">Registrado</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-1" />
                  <span className="text-xs">Registrar</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{client.address}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>Vence: {client.expiredDate}</span>
          </div>
        </div>
      </CardContent>
      
      {/* Diálogo de registro facial */}
      <FaceRegistrationDialog
        isOpen={showFaceRegistration}
        onOpenChange={() => setShowFaceRegistration(false)}
        client={client}
        onFaceRegistered={() => {
          setShowFaceRegistration(false);
          onClientUpdated?.();
        }}
      />
    </Card>
  );
}
