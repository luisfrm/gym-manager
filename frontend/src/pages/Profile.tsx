"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  KeyRound, 
  Edit3, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  UserPlus,
  Users,
  Activity,
  MapPin
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import Template from "./Template";
import { useStore } from "@/hooks/useStore";
import { 
  getProfileRequest, 
  updateProfileRequest, 
  changePasswordRequest,
  createUserRequest,
} from "@/api/api";
import {
  ProfileData,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateUserRequest,
} from "@/lib/types";
import {
  formatDateTime,
  formatUserRole,
  validatePassword,
  validateUsername,
  generateUsername,
  capitalizeFirstLetter,
  getFormErrors,
  clearFormErrors,
} from "@/lib/utils";

// ===================================
// #region VALIDATION SCHEMAS
// ===================================

const profileSchema = z.object({
  username: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres"),
  email: z.string().email("Formato de email inválido"),
});

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

const createUserSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
    email: z.string().email("Formato de email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmar la contraseña es requerido"),
    role: z.enum(["admin", "employee"], { required_error: "Selecciona un rol" }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// #endregion VALIDATION SCHEMAS

// ===================================
// #region COMPONENT INTERFACES
// ===================================

interface EditingState {
  username: boolean;
  email: boolean;
}

interface LoadingState {
  profile: boolean;
  password: boolean;
  createUser: boolean;
}

interface PasswordVisibility {
  current: boolean;
  new: boolean;
  confirm: boolean;
  createPassword: boolean;
  createConfirmPassword: boolean;
}

// #endregion COMPONENT INTERFACES

const initialUser: ProfileData = {
  _id: "123",
  email: "usuario@ejemplo.com",
  username: "Usuario Ejemplo",
  name: "Usuario Ejemplo",
  role: "Administrador",
  createdAt: new Date("2024-01-01").toISOString(),
  updatedAt: new Date("2024-01-15").toISOString(),
};

export default function Profile() {
  // ===================================
  // #region STATE MANAGEMENT
  // ===================================

  const { auth } = useStore();
  const [user, setUser] = useState<ProfileData>(initialUser);
  const [isEditing, setIsEditing] = useState<EditingState>({ username: false, email: false });
  const [editValues, setEditValues] = useState({ username: user.username, email: user.email });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<LoadingState>({ 
    profile: false, 
    password: false, 
    createUser: false 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});
  const [createUserErrors, setCreateUserErrors] = useState<Record<string, string[]>>({});
  const [showPasswords, setShowPasswords] = useState<PasswordVisibility>({
    current: false,
    new: false,
    confirm: false,
    createPassword: false,
    createConfirmPassword: false,
  });

  // #endregion STATE MANAGEMENT

  // ===================================
  // #region EFFECTS
  // ===================================

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    setEditValues({ username: user.username, email: user.email });
  }, [user]);

  // #endregion EFFECTS

  // ===================================
  // #region API FUNCTIONS
  // ===================================

  const loadProfile = async () => {
    try {
      const userData = await getProfileRequest();
      setUser(userData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // #endregion API FUNCTIONS

  // ===================================
  // #region PROFILE EDITING HANDLERS
  // ===================================

  const handleEdit = (field: keyof EditingState) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
    setErrors(clearFormErrors());
  };

  const handleCancel = (field: keyof EditingState) => {
    setIsEditing(prev => ({ ...prev, [field]: false }));
    setEditValues(prev => ({ ...prev, [field]: user[field] }));
    setErrors(clearFormErrors());
  };

  const handleSave = async (field: keyof EditingState) => {
    try {
      setIsLoading(prev => ({ ...prev, profile: true }));
      
      const validation = profileSchema.safeParse(editValues);
      if (!validation.success) {
        const fieldError = validation.error.flatten().fieldErrors[field];
        if (fieldError) {
          setErrors({ [field]: fieldError[0] });
          return;
        }
      }

      const response = await updateProfileRequest(editValues);
      setUser(response.user);
      setIsEditing(prev => ({ ...prev, [field]: false }));
      setErrors(clearFormErrors());
      
      toast.success(`${field === 'username' ? 'Nombre' : 'Email'} actualizado exitosamente`);
    } catch (error: any) {
      const formErrors = getFormErrors(error);
      setErrors({ [field]: formErrors.general });
      toast.error(error.message);
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // #endregion PROFILE EDITING HANDLERS

  // ===================================
  // #region PASSWORD CHANGE HANDLERS
  // ===================================

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(prev => ({ ...prev, password: true }));
    setPasswordErrors({});

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const passwordData = {
        currentPassword: formData.get("currentPassword") as string,
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
      };

      const validation = passwordSchema.safeParse(passwordData);
      if (!validation.success) {
        setPasswordErrors(validation.error.flatten().fieldErrors);
        return;
      }

      await changePasswordRequest({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Contraseña actualizada exitosamente");
      setIsPasswordDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  // #endregion PASSWORD CHANGE HANDLERS

  // ===================================
  // #region USER CREATION HANDLERS
  // ===================================

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(prev => ({ ...prev, createUser: true }));
    setCreateUserErrors({});

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const userData = {
        name: formData.get("name") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
        role: formData.get("role") as "admin" | "employee",
      };

      const validation = createUserSchema.safeParse(userData);
      if (!validation.success) {
        setCreateUserErrors(validation.error.flatten().fieldErrors);
        return;
      }

      await createUserRequest({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      });

      toast.success("Usuario creado exitosamente");
      setIsCreateUserDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(prev => ({ ...prev, createUser: false }));
    }
  };

  const handleGenerateUsername = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get("name") as string;
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        const username = generateUsername(names[0], names[1]);
        const usernameInput = event.target as HTMLFormElement;
        const usernameField = usernameInput.querySelector('input[name="username"]') as HTMLInputElement;
        if (usernameField) {
          usernameField.value = username;
        }
      }
    }
  };

  // #endregion USER CREATION HANDLERS

  // ===================================
  // #region UTILITY FUNCTIONS
  // ===================================

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = () => auth.user?.role === 'admin';

  // #endregion UTILITY FUNCTIONS

  // ===================================
  // #region RENDER
  // ===================================

  return (
    <Template>
      <div className="container max-w-6xl py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Gestiona tu información personal y configuraciones de cuenta
            </p>
          </div>
          {isAdmin() && (
            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreateUser} onChange={handleGenerateUsername}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Crear Nuevo Usuario
                    </DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo usuario al sistema con los permisos correspondientes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Juan Pérez"
                        required
                      />
                      {createUserErrors.name && (
                        <p className="text-sm text-destructive">{createUserErrors.name[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createUsername">Nombre de usuario</Label>
                      <Input
                        id="createUsername"
                        name="username"
                        placeholder="juan.perez"
                        required
                      />
                      {createUserErrors.username && (
                        <p className="text-sm text-destructive">{createUserErrors.username[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createEmail">Correo electrónico</Label>
                      <Input
                        id="createEmail"
                        name="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        required
                      />
                      {createUserErrors.email && (
                        <p className="text-sm text-destructive">{createUserErrors.email[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select name="role" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Empleado</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      {createUserErrors.role && (
                        <p className="text-sm text-destructive">{createUserErrors.role[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createPassword">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="createPassword"
                          name="password"
                          type={showPasswords.createPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('createPassword')}
                        >
                          {showPasswords.createPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {createUserErrors.password && (
                        <p className="text-sm text-destructive">{createUserErrors.password[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createConfirmPassword">Confirmar contraseña</Label>
                      <div className="relative">
                        <Input
                          id="createConfirmPassword"
                          name="confirmPassword"
                          type={showPasswords.createConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('createConfirmPassword')}
                        >
                          {showPasswords.createConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {createUserErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{createUserErrors.confirmPassword[0]}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateUserDialogOpen(false)}
                      disabled={isLoading.createUser}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading.createUser}>
                      {isLoading.createUser ? "Creando..." : "Crear Usuario"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card - Enhanced */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20" />
              <CardHeader className="relative">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'} 
                        className="flex items-center gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        {formatUserRole(user.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Desde {format(new Date(user.createdAt), "MMM yyyy", { locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualiza tu información básica. Los cambios se guardarán automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nombre de usuario</Label>
                  <div className="flex items-center gap-2">
                    {isEditing.username ? (
                      <>
                        <div className="flex-1">
                          <Input
                            value={editValues.username}
                            onChange={(e) => setEditValues(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Ingresa tu nombre de usuario"
                            className={errors.username ? "border-destructive focus-visible:ring-destructive" : ""}
                          />
                          {errors.username && (
                            <p className="text-sm text-destructive mt-1">{errors.username}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSave('username')}
                          disabled={isLoading.profile}
                          className="shrink-0"
                        >
                          {isLoading.profile ? (
                            <Activity className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel('username')}
                          disabled={isLoading.profile}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 rounded-lg border bg-muted/30 p-3 text-sm">
                          {user.username}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit('username')}
                          className="shrink-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Correo electrónico</Label>
                  <div className="flex items-center gap-2">
                    {isEditing.email ? (
                      <>
                        <div className="flex-1">
                          <Input
                            type="email"
                            value={editValues.email}
                            onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Ingresa tu correo electrónico"
                            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive mt-1">{errors.email}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSave('email')}
                          disabled={isLoading.profile}
                          className="shrink-0"
                        >
                          {isLoading.profile ? (
                            <Activity className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel('email')}
                          disabled={isLoading.profile}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 rounded-lg border bg-muted/30 p-3 text-sm">
                          {user.email}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit('email')}
                          className="shrink-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Last updated */}
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Última actualización: {formatDateTime(user.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad
                </CardTitle>
                <CardDescription>
                  Gestiona la seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">Contraseña</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mantén tu cuenta segura
                      </p>
                    </div>
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Cambiar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
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
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  name="currentPassword"
                                  type={showPasswords.current ? "text" : "password"}
                                  autoComplete="current-password"
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => togglePasswordVisibility('current')}
                                >
                                  {showPasswords.current ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {passwordErrors.currentPassword && (
                                <p className="text-sm text-destructive">{passwordErrors.currentPassword[0]}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="newPassword">Nueva contraseña</Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  name="newPassword"
                                  type={showPasswords.new ? "text" : "password"}
                                  autoComplete="new-password"
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => togglePasswordVisibility('new')}
                                >
                                  {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {passwordErrors.newPassword && (
                                <p className="text-sm text-destructive">{passwordErrors.newPassword[0]}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type={showPasswords.confirm ? "text" : "password"}
                                  autoComplete="new-password"
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => togglePasswordVisibility('confirm')}
                                >
                                  {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {passwordErrors.confirmPassword && (
                                <p className="text-sm text-destructive">{passwordErrors.confirmPassword[0]}</p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="secondary" 
                              onClick={() => setIsPasswordDialogOpen(false)}
                              disabled={isLoading.password}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading.password}>
                              {isLoading.password ? "Actualizando..." : "Actualizar contraseña"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Información de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ID de Usuario</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {user._id.slice(-8)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Creado</span>
                    <span>{format(new Date(user.createdAt), "d MMM yyyy", { locale: es })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Última actividad</span>
                    <span>{format(new Date(user.updatedAt), "d MMM yyyy", { locale: es })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Template>
  );

  // #endregion RENDER
}
