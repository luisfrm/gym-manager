"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, CreditCard, Receipt, Tag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Payment } from "@/lib/types";

interface PaymentHistoryProps {
  payments: Payment[];
  isLoading?: boolean;
}

export default function PaymentHistory({ payments, isLoading = false }: PaymentHistoryProps) {
  const getStatusBadge = (status: Payment["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            Pagado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            Pendiente
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="bg-red-500 text-white">
            Fallido
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatAmount = (amount: string, currency: "USD" | "VES") => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historial de pagos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando pagos...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pagos registrados para mostrar.</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {payments.map(payment => (
                <Card key={payment._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{payment.service}</h3>
                      {getStatusBadge(payment.paymentStatus)}
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(payment.date + "T04:00:00Z"), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>{payment.paymentMethod}</span>
                      </div>
                      {payment.paymentReference && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Receipt className="h-4 w-4" />
                          <span>Ref: {payment.paymentReference}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span className="font-medium">{formatAmount(payment.amount, payment.currency)}</span>
                      </div>
                    </div>
                    {payment.description && <p className="mt-2 text-sm text-muted-foreground">{payment.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
