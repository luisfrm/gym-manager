import { refreshTokenRequest, validateTokenRequest } from "@/api/api";
import TokenExpiryPopup from "@/components/dialogs/TokenExpiryPopup";
import { AppState, useStore } from "@/hooks/useStore";
import { RefreshTokenResponse } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TOKEN_CHECK_INTERVAL = 30000; // 30 segundos
const TOKEN_EXPIRY_WARNING = 60; // segundos antes de expirar para mostrar el popup

const ProtectedRoute: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, tokenExpiration } = useStore((state: AppState) => state.auth);
  const { logout, refreshToken } = useStore((state: AppState) => state);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wasTokenExpiredShowed, setWasTokenExpiredShowed] = useState(false);
  const [isTokenExpiredPopupVisible, setIsTokenExpiredPopupVisible] = useState(false);
  const refreshAttemptsRef = useRef(0);
  const MAX_REFRESH_ATTEMPTS = 3;

  // Validar token periódicamente
  const { refetch: validateToken, isError } = useQuery({
    queryKey: ["validateToken"],
    queryFn: validateTokenRequest,
    enabled: false, // No se ejecuta automáticamente
    retry: false
  });

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
    toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }, [logout, navigate]);

  const refreshTokenMutation = useMutation({
    mutationFn: refreshTokenRequest,
    onSuccess: (data: RefreshTokenResponse) => {
      refreshToken(data);
      setWasTokenExpiredShowed(false);
      setIsTokenExpiredPopupVisible(false);
      refreshAttemptsRef.current = 0;
      
      // Recalculate time left with new token
      if (data.tokenExpiration) {
        const expirationDate = new Date(data.tokenExpiration);
        const currentTime = Date.now();
        const timeUntilExpiration = Math.floor((expirationDate.getTime() - currentTime) / 1000);
        setTimeLeft(Math.max(0, timeUntilExpiration));
      }
      
      toast.success("Sesión renovada exitosamente");
    },
    onError: (error: AxiosError) => {
      console.error(error);
      refreshAttemptsRef.current += 1;
      
      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        handleLogout();
      } else {
        toast.error("Error al renovar la sesión. Intentando nuevamente...");
      }
    },
  });

  const handleRenewToken = useCallback(() => {
    setIsTokenExpiredPopupVisible(false);
    refreshTokenMutation.mutate();
  }, [refreshTokenMutation]);

  const handleDismissTokenExpiry = useCallback(() => {
    setIsTokenExpiredPopupVisible(false);
    setWasTokenExpiredShowed(true);
  }, []);

  // Efecto para calcular el tiempo inicial
  useEffect(() => {
    if (tokenExpiration) {
      const expirationDate = new Date(tokenExpiration);
      const currentTime = Date.now();
      const timeUntilExpiration = Math.floor((expirationDate.getTime() - currentTime) / 1000);

      if (timeUntilExpiration <= 0) {
        handleLogout();
        return;
      }

      setTimeLeft(timeUntilExpiration);
    }
  }, [handleLogout, tokenExpiration]);

  // Effect for handling the timer and periodic validation
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          handleLogout();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [handleLogout, timeLeft]);

  // Separate effect for token validation
  useEffect(() => {
    const tokenCheckInterval = setInterval(() => {
      validateToken();
    }, TOKEN_CHECK_INTERVAL);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [validateToken]);

  // Efecto para manejar la visibilidad del popup
  useEffect(() => {
    if (timeLeft <= TOKEN_EXPIRY_WARNING && timeLeft > 0 && !wasTokenExpiredShowed) {
      setIsTokenExpiredPopupVisible(true);
    } else if (timeLeft > TOKEN_EXPIRY_WARNING) {
      setIsTokenExpiredPopupVisible(false);
      setWasTokenExpiredShowed(false); // Reset the flag when we're back to safe time
    }
  }, [timeLeft, wasTokenExpiredShowed]);

  // Efecto para manejar errores de validación
  useEffect(() => {
    if (isError) {
      handleLogout();
    }
  }, [isError, handleLogout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Outlet />
      <TokenExpiryPopup
        timeLeft={timeLeft}
        isVisible={isTokenExpiredPopupVisible}
        onRenew={handleRenewToken}
        onDismiss={handleDismissTokenExpiry}
      />
    </>
  );
};

export default ProtectedRoute;
