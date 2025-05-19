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
  const timeLeftRef = useRef(timeLeft);
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
      refreshAttemptsRef.current = 0;
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

  // Efecto para manejar el timer y la validación periódica
  useEffect(() => {
    timeLeftRef.current = timeLeft;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          handleLogout();
          clearInterval(timer);
          return 0;
        }
        return Math.floor(prevTime) - 1;
      });
    }, 1000);

    // Validación periódica del token
    const tokenCheckInterval = setInterval(() => {
      validateToken();
    }, TOKEN_CHECK_INTERVAL);

    return () => {
      clearInterval(timer);
      clearInterval(tokenCheckInterval);
    };
  }, [handleLogout, validateToken, timeLeft]);

  // Efecto para manejar la visibilidad del popup
  useEffect(() => {
    if (timeLeft === TOKEN_EXPIRY_WARNING && !wasTokenExpiredShowed) {
      setIsTokenExpiredPopupVisible(true);
    } else if (timeLeft > TOKEN_EXPIRY_WARNING) {
      setIsTokenExpiredPopupVisible(false);
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
