import LoginForm from "@/components/LoginForm";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/hooks/useStore";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  const { user } = useStore(state => state.auth);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center min-h-dvh bg-slate-300">
      <LoginForm />
      <Toaster />
    </div>
  );
};

export default Login;
