
import { AppState, useStore } from "@/hooks/useStore";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useStore((state: AppState) => state.auth.isAuthenticated);

  if (isAuthenticated) return (<Outlet />)

  return <Navigate to="/login" />
};

export default ProtectedRoute;