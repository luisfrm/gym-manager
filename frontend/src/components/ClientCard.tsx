import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import formatNumber from "@/lib/formatNumber";
import { isDateActive } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Client } from "@/lib/types";

interface ClientCardProps {
  client: Client;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ClientCard({ client }: ClientCardProps) {
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
          <Badge
            variant="default"
            className={`text-white ${isDateActive(client.expiredDate) ? "bg-green-500" : "bg-red-500"}`}
          >
            {isDateActive(client.expiredDate) ? "Activo" : "Inactivo"}
          </Badge>
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
    </Card>
  );
}
