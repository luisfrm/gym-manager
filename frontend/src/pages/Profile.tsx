"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Mail, Shield, Calendar, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import Template from "./Template";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmar la contraseña es requerido"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

async function changePassword(formData: FormData) {
  const validatedFields = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Here you would typically verify the current password and update with the new one
  // For demo purposes, we'll just return success
  return { success: true };
}

const user = {
  _id: "123",
  email: "usuario@ejemplo.com",
  username: "Usuario Ejemplo",
  role: "Administrador",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-15"),
};

export default function Profile() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const result = await changePassword(formData);

      if (result.error) {
        setErrors(result.error);
        return;
      }

      toast.success("Contraseña actualizada");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error("Hubo un error al actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Template>
      <div className="container max-w-4xl py-10">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>Gestiona tu información personal y credenciales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label>Nombre de usuario</Label>
                  </div>
                  <div className="rounded-lg border bg-card text-card-foreground p-3">{user.username}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label>Correo electrónico</Label>
                  </div>
                  <div className="rounded-lg border bg-card text-card-foreground p-3">{user.email}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Label>Rol</Label>
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label>Fecha de registro</Label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Cambiar contraseña
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handlePasswordChange}>
                    <DialogHeader>
                      <DialogTitle>Cambiar contraseña</DialogTitle>
                      <DialogDescription>
                        Asegúrate de usar una contraseña segura que no uses en otros sitios.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña actual</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          autoComplete="current-password"
                        />
                        {errors.currentPassword && (
                          <p className="text-sm text-destructive">{errors.currentPassword[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva contraseña</Label>
                        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" />
                        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword[0]}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword[0]}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Template>
  );
}
