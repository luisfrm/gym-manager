import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import formatNumber from "@/lib/formatNumber";
import { isDateActive } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ClientCardProps {
  cedula: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  expiredDate?: string;
  isActive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ClientCard({ cedula, firstname, lastname, email, phone, address, expiredDate = "" }: ClientCardProps) {
  return (
    <Card className="w-full mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{`${firstname} ${lastname}`}</h2>
            <Link to={`/clients/${cedula}`}>
              <p className="text-sm text-muted-foreground font-bold">Cédula: {formatNumber(cedula)}</p>
            </Link>
          </div>
          <Badge
            variant="default"
            className={`text-white ${isDateActive(expiredDate) ? "bg-green-500" : "bg-red-500"}`}
          >
            {isDateActive(expiredDate) ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{address}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>Vence: {expiredDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
