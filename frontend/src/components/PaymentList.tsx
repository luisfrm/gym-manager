"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/lib/types";
import formatNumber from "@/lib/formatNumber";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { CopyToClipboard } from "./CopyToClipboard";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { PaymentUpdateDialog } from "./dialogs/PaymentUpdateDialog";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { PaymentCard } from "./PaymentCard";
import useSize from "@/hooks/useSize";

interface PaymentsListProps {
  payments: Payment[];
  isLoading: boolean;
  onUpdatedPayment?: () => void;
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

const PaymentRow = ({ payment, onUpdate }: { payment: Payment; onUpdate: (payment: Payment) => void }) => (
  <TableRow>
    <TableCell className="font-medium">
      {format(new Date(payment.date + "T04:00:00Z"), "dd 'de' MMMM, yyyy", { locale: es })}
    </TableCell>
    <TableCell>
      <div className="flex items-center justify-center gap-2">
        <Link to={`/clients/${payment.clientCedula}`} className="font-bold">
          {formatNumber(payment.clientCedula)}
        </Link>
        <CopyToClipboard text={payment.clientCedula} />
      </div>
    </TableCell>
    <TableCell className="text-center">
      {typeof payment.client !== "string"
        ? `${payment.client.firstname} ${payment.client.lastname}`
        : "Cliente no disponible"}
    </TableCell>
    <TableCell className="text-center">
      {typeof payment.client !== "string" &&
        payment.client.expiredDate &&
        formatDate(payment.client.expiredDate)}
    </TableCell>
    <TableCell className="text-center">{payment.service}</TableCell>
    <TableCell className="text-center">
      {formatCurrency(Number(payment.amount), payment.currency)}
    </TableCell>
    <TableCell className="text-center">{payment.paymentMethod}</TableCell>
    <TableCell className="text-center">{payment.paymentReference}</TableCell>
    <TableCell className="text-center">{getStatusBadge(payment.paymentStatus)}</TableCell>
    <TableCell className="text-center">
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onUpdate(payment)}>
        <span className="sr-only">Editar pago</span>
        <Pencil className="h-4 w-4" />
      </Button>
    </TableCell>
  </TableRow>
);

const PaymentsWaitingBody = ({ limit = 10 }: { limit?: number }) => (
  <>
    {Array(limit)
      .fill(0)
      .map((_, i) => (
        <TableRow key={i}>
          {Array(10)
            .fill(0)
            .map((_, j) => (
              <TableCell key={j} className="text-center">
                <Skeleton className="h-[20px] w-[100px] mx-auto" />
              </TableCell>
            ))}
        </TableRow>
      ))}
  </>
);

const PaymentsWaitingCards = ({ limit = 10 }: { limit?: number }) => (
  <div className="flex flex-col gap-4">
    {Array(limit)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, j) => (
              <div key={j} className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
  </div>
);

export default function PaymentsList({ payments, isLoading, onUpdatedPayment }: PaymentsListProps) {
  const [innerWidth] = useSize();
  const [isOpenPaymentDialog, setIsOpenPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleUpdatePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsOpenPaymentDialog(true);
  };

  return (
    <div className="space-y-4">
      {innerWidth > 981 ? (
        // Desktop Table View
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Fecha</TableHead>
              <TableHead className="text-center">Cédula</TableHead>
              <TableHead className="text-center">Cliente</TableHead>
              <TableHead className="text-center">Expira</TableHead>
              <TableHead className="text-center">Servicio</TableHead>
              <TableHead className="text-center">Monto</TableHead>
              <TableHead className="text-center">Método de Pago</TableHead>
              <TableHead className="text-center">Referencia</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <PaymentsWaitingBody />
            ) : (
              payments.map(payment => (
                <PaymentRow key={payment._id} payment={payment} onUpdate={handleUpdatePayment} />
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        // Mobile Cards View
        <section className="flex flex-col gap-4">
          {isLoading ? (
            <PaymentsWaitingCards />
          ) : (
            payments.length > 0 && payments.map(payment => (
              <PaymentCard
                key={payment._id}
                payment={payment}
                onEdit={handleUpdatePayment}
              />
            ))
          )}
        </section>
      )}
      
      {selectedPayment && (
        <PaymentUpdateDialog
          onPaymentUpdated={onUpdatedPayment}
          isOpen={isOpenPaymentDialog}
          onOpenChange={() => setIsOpenPaymentDialog(false)}
          payment={selectedPayment}
        />
      )}
    </div>
  );
}
