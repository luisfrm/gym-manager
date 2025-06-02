import { useState } from "react";
import { FormGroup, FormLabel, FormLabelError } from "./FormGroup";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStore } from "@/hooks/useStore";
import { toastUtils } from "@/lib/toast";
import { Input } from "./ui/input";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/api/api";
import { LoginResponse } from "@/lib/types";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email({
    message: "*Email inválido",
  }),
  password: z.string().nonempty("*Requerido"),
});

type FormData = z.infer<typeof loginSchema>;

const initialValues: FormData = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const [passwordType, setPasswordType] = useState<string>("password");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialValues,
  });
  const navigate = useNavigate();
  const { setAuth, auth } = useStore();
  const eyeClasses = "absolute top-1/2 right-2 cursor-pointer";

  const changePasswordType = () => {
    if (passwordType === "password") setPasswordType("text");
    else setPasswordType("password");
  };

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data: LoginResponse) => {
      setAuth({
        isAuthenticated: true,
        user: data.user,
        error: null,
        token: data.token,
        tokenExpiration: data.tokenExpiration,
      });

      navigate("/dashboard");
    },
    onError: (error: AxiosError) => {
      console.error("Error:", error);
      if (error.response) {
        if (error.response.status === 400) {
          toastUtils.access.loginError('Usuario no encontrado o datos incorrectos. Verifica tu email y contraseña.');
        } else if (error.response.status === 401) {
          toastUtils.access.loginError('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else if (error.response.status >= 500) {
          toastUtils.access.loginError('Error interno del servidor. Inténtalo de nuevo más tarde.');
        } else {
          toastUtils.access.loginError('Ocurrió un error inesperado. Inténtalo de nuevo más tarde.');
        }
      } else {
        toastUtils.access.loginError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
    },
  });

  const handleLogin = ({ email, password }: FormData) => {
    loginMutation.mutate({ email, password });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Login</CardTitle>
        <CardDescription>Login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleLogin)}>
          {auth.error && <p className="text-red-500 text-sm font-medium leading-none text-center">{auth.error}</p>}
          <div className="grid w-full items-center gap-4">
            <FormGroup>
              <FormLabel>
                <Label htmlFor="email">Email</Label>
                {errors.email && <FormLabelError>{errors.email.message}</FormLabelError>}
              </FormLabel>
              <Input id="name" placeholder="Ingresa tu correo" type="email" {...register("email")} />
            </FormGroup>
            <FormGroup className="relative flex flex-col gap-2">
              <FormLabel>
                <Label htmlFor="password">Contraseña</Label>
                {errors.password && <FormLabelError>{errors.password.message}</FormLabelError>}
              </FormLabel>
              <Input id="password" placeholder="Password" type={passwordType} {...register("password")} />
              {passwordType === "password" ? (
                <EyeOff className={eyeClasses} onClick={changePasswordType} />
              ) : (
                <Eye className={eyeClasses} onClick={changePasswordType} />
              )}
            </FormGroup>
            <FormGroup>
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
              </Button>
            </FormGroup>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
