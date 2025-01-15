import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mail, Phone, MapPin, Calendar, MoreVertical, Edit, Trash } from 'lucide-react'
import formatNumber from "@/lib/formatNumber"

interface ClientCardProps {
  cedula: string
  firstname: string
  lastname: string
  email: string
  phone: string
  address: string
  expiredDate?: string
  isActive?: boolean
  onEdit: () => void
  onDelete: () => void
}

export function ClientCard({
  cedula,
  firstname,
  lastname,
  email,
  phone,
  address,
  expiredDate="",
  isActive,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <Card className="w-full mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{`${firstname} ${lastname}`}</h2>
            <p className="text-sm text-muted-foreground">Cédula: {formatNumber(cedula)}</p>
          </div>
          <Badge variant="default" className={`text-white ${isActive ? "bg-green-500" : "bg-red-500"}`}>
            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>{address}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>Vence: {expiredDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">
              <MoreVertical className="h-4 w-4" />
              <span>Acciones</span>
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

