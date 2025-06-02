import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, User, DollarSign, Receipt, Hash, Pencil } from "lucide-react";
import formatNumber from "@/lib/formatNumber";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Payment } from "@/lib/types";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/currency";
import { CopyToClipboard } from "./CopyToClipboard";

interface PaymentCardProps {
  payment: Payment;
  onEdit?: (payment: Payment) => void;
}

const getStatusBadge = (status: Payment["paymentStatus"]) => {
  const statusConfig = {
    paid: { label: "Pagado", className: "bg-green-500 text-white" },
    pending: { label: "Pendiente", className: "bg-yellow-500 text-white" },
    failed: { label: "Fallido", className: "bg-red-500 text-white" },
  };

  const config = statusConfig[status];
  return config ? (
    <Badge variant="default" className={config.className}>
      {config.label}
    </Badge>
  ) : null;
};

export function PaymentCard({ payment, onEdit }: PaymentCardProps) {
  const clientName = typeof payment.client !== "string" 
    ? `${payment.client.firstname} ${payment.client.lastname}` 
    : "Cliente no disponible";
  
  const clientExpiration = typeof payment.client !== "string" && payment.client.expiredDate 
    ? formatDate(payment.client.expiredDate) 
    : "N/A";

  return (
    <Card className="w-full mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{payment.service}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(payment.date + "T04:00:00Z"), "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(payment.paymentStatus)}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(payment)}
              title="Editar pago"
            >
              <Pencil className="w-4 h-4 mr-1" />
              <span className="text-xs">Editar</span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Cliente:</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/clients/${payment.clientCedula}`} className="font-bold text-sm">
                {clientName}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Hash className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Cédula:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{formatNumber(payment.clientCedula)}</span>
              <CopyToClipboard text={payment.clientCedula} />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Expira:</span>
            </div>
            <span className="text-sm font-medium">{clientExpiration}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Monto:</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(Number(payment.amount), payment.currency)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Método:</span>
            </div>
            <span className="text-sm font-medium">{payment.paymentMethod}</span>
          </div>
          
          {payment.paymentReference && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-muted-foreground" />
                <span className="text-sm">Referencia:</span>
              </div>
              <span className="text-sm font-medium text-right max-w-[120px] truncate">
                {payment.paymentReference}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 