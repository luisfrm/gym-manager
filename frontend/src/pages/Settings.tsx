"use client";

import { useState } from "react";
import { Globe, Lock, Moon, Sun, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Template from "./Template";

interface ConfigurationPageProps {
  theme: "light" | "dark" | "system";
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: "public" | "private" | "friends";
}

const initialConfig: ConfigurationPageProps = {
  theme: "system" as const,
  language: "es",
  emailNotifications: true,
  pushNotifications: false,
  profileVisibility: "friends" as const,
};

export default function Settings() {
  const [config, setConfig] = useState(initialConfig);

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prevConfig => ({ ...prevConfig, [key]: value }));
  };

  const handleSave = () => {
    // Here you would typically send the config to your backend
    console.log("Saving configuration:", config);
    toast.success("Configuración guardada");
  };

  return (
    <Template>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">Configuración</h1>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>Administra las configuraciones generales de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={config.theme} onValueChange={value => handleConfigChange("theme", value)}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Selecciona un tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="mr-2 h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="mr-2 h-4 w-4" />
                          Oscuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Globe className="mr-2 h-4 w-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={config.language} onValueChange={value => handleConfigChange("language", value)}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Selecciona un idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
                <CardDescription>Elige cómo quieres recibir notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificaciones por correo</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones importantes por correo electrónico
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={config.emailNotifications}
                    onCheckedChange={checked => handleConfigChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Notificaciones push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones en tiempo real en tu dispositivo
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={config.pushNotifications}
                    onCheckedChange={checked => handleConfigChange("pushNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Privacidad</CardTitle>
                <CardDescription>Administra quién puede ver tu información</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Visibilidad del perfil</Label>
                  <Select
                    value={config.profileVisibility}
                    onValueChange={value => handleConfigChange("profileVisibility", value)}
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Selecciona la visibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe className="mr-2 h-4 w-4" />
                          Público
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Solo amigos
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Lock className="mr-2 h-4 w-4" />
                          Privado
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Guardar cambios</Button>
        </div>
      </div>
    </Template>
  );
}
