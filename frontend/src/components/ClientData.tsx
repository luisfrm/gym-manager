import { ClientCard } from "./ClientCard";
import useSize from "@/hooks/useSize";
import { Client } from "@/lib/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import formatNumber from "@/lib/formatNumber";
import { Badge } from "./ui/badge";
import { formatDate, isDateActive } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import CopyToClipboard from "./CopyToClipboard";

interface ClientDataProps {
  isLoading: boolean;
  clients: Client[];
  limit?: number;
}

const ClientData = ({ isLoading, clients, limit = 10 }: ClientDataProps) => {
  const [innerWidth] = useSize();

  return (
    <>
      {innerWidth > 981 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer w-[50px] py-4">#</TableHead>
              <TableHead className="cursor-pointer">Cedula</TableHead>
              <TableHead className="cursor-pointer">Nombre</TableHead>
              <TableHead className="cursor-pointer">Apellido</TableHead>
              <TableHead className="cursor-pointer">Email</TableHead>
              <TableHead className="cursor-pointer">Telefono</TableHead>
              <TableHead className="cursor-pointer">Direccion</TableHead>
              <TableHead className="cursor-pointer">Fecha de vencimiento</TableHead>
              <TableHead className="cursor-pointer text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{isLoading ? <ClientWaitingBody limit={limit} /> : <ClientBody clients={clients} />}</TableBody>
          <TableCaption>Lista de clientes.</TableCaption>
        </Table>
      ) : (
        // Mobile view
        <section className="flex flex-col gap-4">
          {clients.length > 0 &&
            clients.map(client => (
              <ClientCard
                client={client}
                key={client.cedula}
              />
            ))}
        </section>
      )}
    </>
  );
};

interface ClientBodyProps {
  clients: Client[];
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isLink?: boolean;
  to?: string;
}

const TableCellContent = ({ children, className = "", isLink = false, to }: TableCellProps) => {
  const cellContent = isLink && to ? (
    <Link to={to} className="block w-full">
      {children}
    </Link>
  ) : (
    children
  );

  return (
    <TableCell className={`text-ellipsis whitespace-nowrap max-w-[200px] overflow-hidden text-start h-10 ${className}`}>
      {cellContent}
    </TableCell>
  );
};

const ClientBody = ({ clients }: ClientBodyProps) => {
  if (clients.length === 0) return null;

  return (
    <>
      {clients.map((client: Client, index: number) => (
        <TableRow key={client.cedula}>
          <TableCellContent className="font-bold">
            {index + 1}
          </TableCellContent>
          
          <TableCellContent>
            <div className="flex items-center gap-2">
              {formatNumber(client.cedula)}
              <CopyToClipboard text={client.cedula} />
            </div>
          </TableCellContent>

          <TableCellContent isLink to={`/clients/${client.cedula}`} className="font-bold">
            {formatNumber(client.firstname)}
          </TableCellContent>

          <TableCellContent>
            {client.lastname}
          </TableCellContent>

          <TableCellContent>
            {client.email}
          </TableCellContent>

          <TableCellContent>
            {client.phone}
          </TableCellContent>

          <TableCellContent>
            {client.address}
          </TableCellContent>

          <TableCellContent>
            {formatDate(client.expiredDate)}
          </TableCellContent>

          <TableCellContent className="text-right">
            <Badge
              variant="default"
              className={`text-white ${isDateActive(client.expiredDate) ? "bg-green-500" : "bg-red-500"}`}
            >
              {isDateActive(client.expiredDate) ? "Activo" : "Inactivo"}
            </Badge>
          </TableCellContent>
        </TableRow>
      ))}
    </>
  );
};

const ClientWaitingBody = ({ limit = 10 }: { limit?: number }) => {
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

export default ClientData;
