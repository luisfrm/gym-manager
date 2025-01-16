import { ClientCard } from "./ClientCard";
import useSize from "@/hooks/useSize";
import { Client } from "@/lib/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import formatNumber from "@/lib/formatNumber";
import { Badge } from "./ui/badge";
import { formatDate, isDateActive } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

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
        <Table className="border" style={{ borderRadius: "0.5rem" }}>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer w-[50px]">#</TableHead>
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
        <section className="flex flex-col gap-4">
          {clients.length > 0 &&
            clients.map(client => (
              <ClientCard
                key={client.cedula}
                address={client.address}
                cedula={client.cedula}
                expiredDate={formatDate(client.expiredDate)}
                firstname={client.firstname}
                lastname={client.lastname}
                email={client.email}
                phone={client.phone}
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

const ClientBody = ({ clients }: ClientBodyProps) => {
  return (
    <>
      {clients.length > 0 &&
        clients.map((client: Client, index: number) => (
          <TableRow key={client.cedula}>
            <TableCell key={client.cedula} className="font-bold text-ellipsis whitespace-nowrap">
              {index + 1}
            </TableCell>
            <TableCell className="font-bold text-ellipsis whitespace-nowrap">
              <Link to={`/clients/${client.cedula}`}>{formatNumber(client.cedula)}</Link>
            </TableCell>
            <TableCell className="text-ellipsis whitespace-nowrap max-w-[200px] overflow-hidden text-start">
              {client.firstname}
            </TableCell>
            <TableCell className="text-ellipsis whitespace-nowrap max-w-[200px] overflow-hidden text-start">
              {client.lastname}
            </TableCell>
            <TableCell className="text-ellipsis whitespace-nowrap max-w-[200px] overflow-hidden text-start">
              {client.email}
            </TableCell>
            <TableCell className="text-ellipsis whitespace-nowrap max-w-[200px] overflow-hidden text-start">
              {client.phone}
            </TableCell>
            <TableCell className="text-ellipsis whitespace-nowrap max-w-[200px] overflow-hidden text-start">
              {client.address}
            </TableCell>
            <TableCell className="text-ellipsis whitespace-nowrap max-w-[200px] overflow-hidden text-start">
              {formatDate(client.expiredDate)}
            </TableCell>
            <TableCell className="text-right">
              <Badge
                variant="default"
                className={`text-white ${isDateActive(client.expiredDate) ? "bg-green-500" : "bg-red-500"}`}
              >
                {isDateActive(client.expiredDate) ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
    </>
  );
};

const ClientWaitingBody = ({ limit = 10 }: { limit?: number }) => {
  return (
    <>
      {Array(limit).fill(0).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="font-bold">
            <Skeleton className="h-[20px] w-[10px]" />
          </TableCell>
          <TableCell className="font-bold">
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
