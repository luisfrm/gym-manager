import { ClientCard } from "./ClientCard";
import useSize from "@/hooks/useSize";
import { Client } from "@/lib/types";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import formatNumber from "@/lib/formatNumber";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

const onEdit = () => console.log("Editar cliente");
const onDelete = () => console.log("Eliminar cliente");

const ClientData = ({ isLoading, clients }: { isLoading: boolean; clients: Client[] }) => {
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
              <TableHead className="cursor-pointer ">Nombre</TableHead>
              <TableHead className="cursor-pointer ">Apellido</TableHead>
              <TableHead className="cursor-pointer ">Email</TableHead>
              <TableHead className="cursor-pointer ">Telefono</TableHead>
              <TableHead className="cursor-pointer ">Direccion</TableHead>
              <TableHead className="cursor-pointer ">Fecha de vencimiento</TableHead>
              <TableHead className="cursor-pointer text-right">Estado</TableHead>
              <TableHead className="cursor-pointer text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ClientBody clients={clients} />
          </TableBody>
          <TableCaption>Lista de clientes.</TableCaption>
        </Table>
      ) : (
        <>
          {clients.length > 0 &&
            clients.map(client => (
              <ClientCard
                key={client.cedula}
                address={client.address}
                cedula={client.cedula}
                expiredDate={client.expiredDate}
                firstname={client.firstName}
                lastname={client.lastName}
                email={client.email}
                phone={client.phone}
                isActive={client.isActive}
                onEdit={() => console.log("Editar cliente")}
                onDelete={() => console.log("Eliminar cliente")}
              />
            ))}
        </>
      )}
    </>
  );
};

const ClientBody = ({ clients }: { clients: Client[] }) => {
  return (
    <>
      {clients.length > 0 &&
        clients.map((client: Client) => (
          <TableRow key={client.cedula}>
            <TableCell key={client.cedula} className="font-medium">{formatNumber(client.cedula)}</TableCell>
            <TableCell>{client.firstName}</TableCell>
            <TableCell>{client.lastName}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone}</TableCell>
            <TableCell>{client.address}</TableCell>
            <TableCell>16-10-2024</TableCell>
            <TableCell className="text-right">
              <Badge variant="default" className={`text-white ${client.isActive ? "bg-green-500" : "bg-red-500"}`}>
                {client.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="icon" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="hover:bg-sky-200 cursor-pointer" onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4 text-sky-600" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-red-200 cursor-pointer" onClick={onDelete}>
                    <Trash className="mr-2 h-4 w-4 text-red-600" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
    </>
  );
};

export default ClientData;
