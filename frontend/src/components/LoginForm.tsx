import { useState } from "react";
import { FormGroup, FormLabel, FormLabelError } from "./FormGroup";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStore } from "@/hooks/useStore";

import { Input } from "./ui/input";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/api/api";
import { LoginResponse } from "@/lib/types";
import { AxiosError } from "axios";
import { TIME_TO_HIDE_ERROR } from "@/lib/config";

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
    resetField,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialValues,
  });

  const { setAuth, auth } = useStore();

  const eyeClasses = "absolute top-1/2 right-2 cursor-pointer";

  const [isLoading] = useState(false);

  const changePasswordType = () => {
    if (passwordType === "password") setPasswordType("text");
    else setPasswordType("password");
  };

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data: LoginResponse) => {
      setAuth({ isAuthenticated: true, user: data.user, error: null, token: data.token });
    },
    onError: (error: AxiosError) => {
      console.error(error);
      if(error.response?.status === 400) {
        const errorMessage = error.response?.data?.message ?? "Correo o contraseña incorrectos";
        resetField("password");
        setAuth({ isAuthenticated: false, user: null, error: errorMessage, token: null });

        setTimeout(() => {
          setAuth({ isAuthenticated: false, user: null, error: null, token: null });
        }, TIME_TO_HIDE_ERROR);
      };
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
            <FormGroup className="relative">
              <FormLabel>
                <Label htmlFor="password">
                  Contraseña
                </Label>
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
              <Button type="submit">{isLoading ? "Cargando..." : "Login"}</Button>
            </FormGroup>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Register
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
