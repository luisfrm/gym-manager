"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronUp, Ellipsis } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Payment } from "@/lib/types";

interface PaymentsListProps {
  payments: Payment[];
}

export default function PaymentsList({ payments: initialPayments }: PaymentsListProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Payment; direction: "asc" | "desc" } | null>(null);

  const sortPayments = (key: keyof Payment) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sortedPayments = [...payments].sort((a, b) => {
      if (a[key] && b[key]) {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    setPayments(sortedPayments);
    setSortConfig({ key, direction });
  };

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
            <TableHead className="w-[180px]">
              <Button variant="ghost" onClick={() => sortPayments("date")}>
                Fecha
                {sortConfig?.key === "date" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => sortPayments("amount")}>
                Monto
                {sortConfig?.key === "amount" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(payment => (
            <TableRow key={payment._id}>
              <TableCell className="font-medium">
                {format(new Date(payment.date), "d 'de' MMMM, yyyy", { locale: es })}
              </TableCell>
              <TableCell>
                {typeof payment.client !== "string"
                  ? `${payment.client.firstname} ${payment.client.lastname}`
                  : "Cliente no disponible"}
              </TableCell>
              <TableCell>{payment.service}</TableCell>
              <TableCell className="text-right">{formatCurrency(Number(payment.amount), payment.currency)}</TableCell>
              <TableCell>{payment.paymentMethod}</TableCell>
              <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
