import { useState } from "react";
import FormGroup from "./FormGroup";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [passwordType, setPasswordType] = useState<string>("password");

  const eyeClasses = "absolute top-5 right-2 cursor-pointer";

  const changePasswordType = () => {
    if (passwordType === "password") setPasswordType("text");
    else setPasswordType("password");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Login</CardTitle>
        <CardDescription>Login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <FormGroup>
              <Label id="email">Email</Label>
              <Input id="name" placeholder="Email" type="email" />
            </FormGroup>
            <FormGroup className="relative">
              <Label id="password">Password</Label>
              <Input id="password" placeholder="Password" type={passwordType} />
              {passwordType === "password" ? (
                <EyeOff className={eyeClasses} onClick={changePasswordType} />
              ) : (
                <Eye className={eyeClasses} onClick={changePasswordType} />
              )}
            </FormGroup>
            <FormGroup>
              <Button>Login</Button>
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
