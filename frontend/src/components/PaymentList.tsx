"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/lib/types";
import formatNumber from "@/lib/formatNumber";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PaymentsListProps {
  payments: Payment[];
  isLoading: boolean;
}

export default function PaymentsList({ payments }: PaymentsListProps) {
  const formatCurrency = (amount: number, currency: "USD" | "VES") => {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency }).format(amount);
  };

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
            {/* <TableHead className="text-right">Acciones</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(payment => (
            <TableRow key={payment._id}>
              <TableCell className="font-medium">
                {format(new Date(payment.date), "d 'de' MMMM, yyyy", { locale: es })}
              </TableCell>
              <TableCell className="text-center font-bold">
                <Link to={`/clients/${payment.clientCedula}`}>{formatNumber(payment.clientCedula)}</Link>
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
              <TableCell className="text-center">{formatCurrency(Number(payment.amount), payment.currency)}</TableCell>
              <TableCell className="text-center">{payment.paymentMethod}</TableCell>
              <TableCell className="text-center">{payment.paymentReference}</TableCell>
              <TableCell className="text-right">{getStatusBadge(payment.paymentStatus)}</TableCell>
              {/* <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                    <DropdownMenuItem>Editar pago</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Eliminar pago</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
