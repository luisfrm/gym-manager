import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function LoginForm() {
  return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle>Login</CardTitle>
				<CardDescription>Login to your account</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-2">
              <Label id="email">Email</Label>
              <Input id="name" placeholder="Email" type="email" />
            </div>
            <div className="flex flex-col space-y-2">
              <Label id="password">Password</Label>
              <Input id="password" placeholder="Password" type="password" />
            </div>
            <div className="flex flex-col space-y-2">
              <Button>Login</Button>
            </div>
          </div>
				</form>
			</CardContent>
		</Card>
	);
}