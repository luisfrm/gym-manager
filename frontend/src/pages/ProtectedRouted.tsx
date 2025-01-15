import { AppState, useStore } from "@/hooks/useStore";
import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useStore((state: AppState) => state.auth.isAuthenticated);
  const tokenExpiration = useStore((state: AppState) => state.auth.tokenExpiration);
  const [showedDialogExpiration, setShowedDialogExpiration] = useState<boolean>(false);

  useEffect(() => {
        
  }, [isAuthenticated, tokenExpiration]);

  if (isAuthenticated) return <Outlet />;

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
