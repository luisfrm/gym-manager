import { ClientCard } from "./ClientCard";
import useSize from "@/hooks/useSize";
import { Client } from "@/lib/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import formatNumber from "@/lib/formatNumber";
import { Badge } from "./ui/badge";
import { formatDate, isDateActive } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ClientDataProps {
  isLoading: boolean;
  clients: Client[];
}

const ClientData = ({ isLoading, clients }: ClientDataProps) => {
  const [innerWidth] = useSize();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      {innerWidth > 981 ? (
        <Table className="border" style={{ borderRadius: "0.5rem" }}>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer w-[100px]">Cedula</TableHead>
              <TableHead className="cursor-pointer">Nombre</TableHead>
              <TableHead className="cursor-pointer">Apellido</TableHead>
              <TableHead className="cursor-pointer">Email</TableHead>
              <TableHead className="cursor-pointer">Telefono</TableHead>
              <TableHead className="cursor-pointer">Direccion</TableHead>
              <TableHead className="cursor-pointer">Fecha de vencimiento</TableHead>
              <TableHead className="cursor-pointer text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ClientBody clients={clients} />
          </TableBody>
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
        clients.map((client: Client) => (
          <TableRow key={client.cedula}>
            <TableCell key={client.cedula} className="font-bold">
              <Link to={`/clients/${client.cedula}`}>{formatNumber(client.cedula)}</Link>
            </TableCell>
            <TableCell>{client.firstname}</TableCell>
            <TableCell>{client.lastname}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone}</TableCell>
            <TableCell>{client.address}</TableCell>
            <TableCell>{formatDate(client.expiredDate)}</TableCell>
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

export default ClientData;
