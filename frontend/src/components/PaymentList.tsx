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
import CopyToClipboard from "./CopyToClipboard";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { PaymentUpdateDialog } from "./dialogs/PaymentUpdateDialog";
import { useState } from "react";

interface PaymentsListProps {
  payments: Payment[];
  isLoading: boolean;
  onUpdatedPayment?: () => void;
}

export default function PaymentsList({ payments, isLoading, onUpdatedPayment }: PaymentsListProps) {
  const formatCurrency = (amount: number, currency: "USD" | "VES") => {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency }).format(amount);
  };
  const [isOpenPaymentDialog, setIsOpenPaymentDialog] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);

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

  const handleUpdatePayment = (payment: Payment) => () => {
    setPayment(payment);
    setIsOpenPaymentDialog(true);
    onUpdatedPayment?.();
  };

  const onOpenChangePaymentDialog = () => {
    setIsOpenPaymentDialog(!isOpenPaymentDialog);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Fecha</TableHead>
            <TableHead className="text-center">Cedula</TableHead>
            <TableHead className="text-center">Cliente</TableHead>
            <TableHead className="text-center">Expira</TableHead>
            <TableHead className="text-center">Servicio</TableHead>
            <TableHead className="text-center">Monto</TableHead>
            <TableHead className="text-center">Método de Pago</TableHead>
            <TableHead className="text-center">Referencia</TableHead>
            <TableHead className="text-right">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <PaymentsWaitingBody />
          ) : (
            payments.map(payment => (
              <TableRow key={payment._id}>
                <TableCell className="font-medium">
                  {format(new Date(payment.date + "T04:00:00Z"), "dd 'de' MMMM, yyyy", { locale: es })}
                </TableCell>
                <TableCell className="text-ellipsis whitespace-nowrap flex items-center gap-2 font-bold">
                  <Link to={`/clients/${payment.clientCedula}`}>{formatNumber(payment.clientCedula)}</Link>
                  <CopyToClipboard text={payment.clientCedula} />
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
                <TableCell className="text-right">{getStatusBadge(payment.paymentStatus)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" className="h-8 w-8 p-0" onClick={handleUpdatePayment(payment)}>
                    <span className="sr-only">Abrir menú</span>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {payment && (
        <PaymentUpdateDialog onPaymentUpdated={onUpdatedPayment} isOpen={isOpenPaymentDialog} onOpenChange={onOpenChangePaymentDialog} payment={payment} />
      )}
    </div>
  );
}

const PaymentsWaitingBody = ({ limit = 10 }: { limit?: number }) => {
  return (
    <>
      {Array(limit)
        .fill(0)
        .map((_, i) => (
          <TableRow key={i}>
            <TableCell className="font-bold py-4">
              <Skeleton className="h-[20px] w-[10px]" />
            </TableCell>
            <TableCell className="font-bold py-4">
              <Skeleton className="h-[20px] w-[80px]" />
            </TableCell>
            <TableCell className="max-w-[200px] text-start">
              <Skeleton className="h-[20px] w-[60px]" />
            </TableCell>
            <TableCell className="max-w-[200px] text-start">
              <Skeleton className="h-[20px] w-[80px]" />
            </TableCell>
            <TableCell className="max-w-[200px] text-start">
              <Skeleton className="h-[20px] w-[150px]" />
            </TableCell>
            <TableCell className="max-w-[200px] text-start">
              <Skeleton className="h-[20px] w-[100px]" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-[20px] w-[150px]" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-[20px] w-[80px]" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-[20px] w-[50px]" />
            </TableCell>
          </TableRow>
        ))}
    </>
  );
};
