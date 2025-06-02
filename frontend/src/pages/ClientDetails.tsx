import { MoreVertical, ArrowLeft, Mail, Phone, MapPin, Calendar, Camera, Shield, RefreshCw, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ReusableDropdown } from "@/components/ui/reusable-dropdown";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getClientByIdRequest, getClientPaymentsRequest } from "@/api/api";
import { isDateActive } from "@/lib/utils";
import { Client, Payment } from "@/lib/types";
import Template from "./Template";
import { ClientUpdateDialog } from "@/components/dialogs/ClientUpdateDialog";
import { useState } from "react";
import { ClientRemoveDialog } from "@/components/dialogs/ClientRemoveDialog";
import { Skeleton } from "@/components/ui/skeleton";
import formatNumber from "@/lib/formatNumber";
import PaymentHistory from "@/components/PaymentHistory";
import { useStore } from "@/hooks/useStore";
import { FaceRegistrationDialog } from "@/components/dialogs/FaceRegistrationDialog";

export default function ClientDetails() {
  const role = useStore(state => state.auth.user?.role ?? "");
  const navigate = useNavigate();
  const { cedula } = useParams<{ cedula: string }>();
  const [isUpdateClientOpen, setIsUpdateClientOpen] = useState(false);
  const [isRemoveClientOpen, setIsRemoveClientOpen] = useState(false);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);

  const {
    data: client,
    isLoading,
    refetch,
  } = useQuery<Client>({
    queryKey: ["client", cedula],
    queryFn: () => getClientByIdRequest(cedula!),
    enabled: !!cedula,
  });

  const {
    data: payments,
    isLoading: isPaymentsLoading,
  } = useQuery<Payment[]>({
    queryKey: ["clientPayments", cedula],
    queryFn: () => getClientPaymentsRequest(cedula!),
    enabled: !!cedula,
  });

  const handleUpdateClientOpen = () => {
    // Forzar cierre del dropdown antes de abrir modal
    setTimeout(() => {
      setIsUpdateClientOpen(true);
    }, 100);
  };

  const handleRemoveClientOpen = () => {
    // Forzar cierre del dropdown antes de abrir modal
    setTimeout(() => {
      setIsRemoveClientOpen(true);
    }, 100);
  };

  const handleClientUpdated = () => {
    refetch();
    handleCloseUpdateDialog();
  };

  const handleClientRemoved = () => {
    navigate("/clients");
  };

  const handleCloseUpdateDialog = () => {
    // Limpiar cualquier pointer-events pendiente del dropdown
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
    setIsUpdateClientOpen(false);
  };

  const handleCloseRemoveDialog = () => {
    // Limpiar cualquier pointer-events pendiente del dropdown
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
    setIsRemoveClientOpen(false);
  };

  const handleFaceRegistration = () => {
    // Forzar cierre del dropdown antes de abrir modal
    setTimeout(() => {
      setShowFaceRegistration(true);
    }, 100);
  };

  return (
    <Template>
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/clients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Detalles del Cliente</h1>
          </div>
          <ReusableDropdown
            className={`${isLoading ? "hidden" : ""}`}
            trigger={
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            }
          >
            <DropdownMenuItem onClick={handleUpdateClientOpen}>Editar cliente</DropdownMenuItem>
            {role === "admin" && (
              <DropdownMenuItem onClick={handleRemoveClientOpen} className="text-destructive">
                Eliminar cliente
              </DropdownMenuItem>
            )}
          </ReusableDropdown>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <ClientDetailsSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{`${client?.firstname} ${client?.lastname}`}</h2>
                    <p className="text-muted-foreground">Cédula: {formatNumber(client?.cedula ?? "")}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      variant="default"
                      className={`text-white ${isDateActive(client?.expiredDate) ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {isDateActive(client?.expiredDate) ? "Activo" : "Inactivo"}
                    </Badge>
                    {client?.hasFaceRegistered ? (
                      <ReusableDropdown
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            title="Opciones de registro facial"
                          >
                            <Shield className="w-4 h-4 text-green-600 mr-2" />
                            <span>Registrado</span>
                            <MoreVertical className="w-3 h-3 ml-2" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={handleFaceRegistration}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Actualizar registro
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleFaceRegistration}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar registro
                        </DropdownMenuItem>
                      </ReusableDropdown>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleFaceRegistration}
                        title="Registrar cara"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        <span>Registrar cara</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha de vencimiento</p>
                      <p className="text-sm text-muted-foreground">{client?.expiredDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {client?.hasFaceRegistered ? (
                      <Shield className="h-5 w-5 text-green-600" />
                    ) : (
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Reconocimiento Facial</p>
                      <p className="text-sm text-muted-foreground">
                        {client?.hasFaceRegistered ? "Registrado" : "No registrado"}
                      </p>
                    </div>
                  </div>
                  {client?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{client?.email}</p>
                      </div>
                    </div>
                  )}
                  {client?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Teléfono</p>
                        <p className="text-sm text-muted-foreground">{client?.phone}</p>
                      </div>
                    </div>
                  )}
                  {client?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Dirección</p>
                        <p className="text-sm text-muted-foreground">{client.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <PaymentHistory isLoading={isPaymentsLoading} payments={payments ?? []} />
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Asistencias</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Aquí se mostrará el registro de asistencias del cliente</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <ClientUpdateDialog
        isOpen={isUpdateClientOpen}
        onOpenChange={handleCloseUpdateDialog}
        client={client}
        onClientUpdated={handleClientUpdated}
      />
      <ClientRemoveDialog
        isOpen={isRemoveClientOpen}
        onOpenChange={handleCloseRemoveDialog}
        client={client}
        onClientDeleted={handleClientRemoved}
      />
      
      {client && (
        <FaceRegistrationDialog
          isOpen={showFaceRegistration}
          onOpenChange={() => setShowFaceRegistration(false)}
          client={client}
          onFaceRegistered={() => {
            setShowFaceRegistration(false);
            refetch();
          }}
        />
      )}
    </Template>
  );
}

const ClientDetailsSkeleton = () => {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-[30px] w-[150px]" />
            </div>
            <Skeleton className="h-[20px] w-[50px]" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha de vencimiento</p>
                <Skeleton className="h-[20px] w-[150px]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <Skeleton className="h-[20px] w-[150px]" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Teléfono</p>
                <Skeleton className="h-[20px] w-[150px]" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dirección</p>
                <Skeleton className="h-[20px] w-[150px]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Historial de pagos</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Aquí se mostrará el historial de pagos del cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Asistencias</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Aquí se mostrará el registro de asistencias del cliente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
