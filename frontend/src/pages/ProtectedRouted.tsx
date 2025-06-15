import { refreshTokenRequest, validateTokenRequest } from "@/api/api";
import TokenExpiryPopup from "@/components/dialogs/TokenExpiryPopup";
import { AppState, useStore } from "@/hooks/useStore";
import { RefreshTokenResponse } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { toastUtils } from "@/lib/toast";

const TOKEN_EXPIRY_WARNING = 60;

const ProtectedRoute: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, tokenExpiration } = useStore((state: AppState) => state.auth);
  const { logout, refreshToken } = useStore((state: AppState) => state);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wasTokenExpiredShowed, setWasTokenExpiredShowed] = useState(false);
  const [isTokenExpiredPopupVisible, setIsTokenExpiredPopupVisible] = useState(false);
  const refreshAttemptsRef = useRef(0);

  const { refetch: validateToken, isError } = useQuery({
    queryKey: ["validateToken"],
    queryFn: validateTokenRequest,
    enabled: false,
    retry: false
  });

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
    toastUtils.access.sessionExpired();
  }, [logout, navigate]);

  const refreshTokenMutation = useMutation({
    mutationFn: refreshTokenRequest,
    onSuccess: (data: RefreshTokenResponse) => {
      refreshToken(data);
      setWasTokenExpiredShowed(false);
      setIsTokenExpiredPopupVisible(false);
      refreshAttemptsRef.current = 0;
      
      if (data.tokenExpiration) {
        const expirationDate = new Date(data.tokenExpiration);
        const currentTime = Date.now();
        const timeUntilExpiration = Math.floor((expirationDate.getTime() - currentTime) / 1000);
        setTimeLeft(Math.max(0, timeUntilExpiration));
      }
      
      toastUtils.access.sessionRenewed();
    },
    onError: (error: any) => {
      if (error?.response?.status !== 401) {
        console.error("Refresh token error:", error);
        toastUtils.access.connectionError();
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

  useEffect(() => {
    if (tokenExpiration) {
      const expirationDate = new Date(tokenExpiration);
      const currentTime = Date.now();
      const timeUntilExpiration = Math.floor((expirationDate.getTime() - currentTime) / 1000);

      if (timeUntilExpiration <= 0) {
        // Usar un pequeño timeout para evitar actualizaciones durante el render
        const timeoutId = setTimeout(() => {
          handleLogout();
        }, 0);
        return () => clearTimeout(timeoutId);
      }

      setTimeLeft(timeUntilExpiration);
    }
  }, [handleLogout, tokenExpiration]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          // Usar un pequeño timeout para evitar actualizaciones durante el render
          setTimeout(() => {
            handleLogout();
          }, 0);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [handleLogout, timeLeft]);

  // Handle token expiry popup
  useEffect(() => {
    if (timeLeft <= TOKEN_EXPIRY_WARNING && timeLeft > 0 && !wasTokenExpiredShowed) {
      setIsTokenExpiredPopupVisible(true);
    } else if (timeLeft > TOKEN_EXPIRY_WARNING) {
      setIsTokenExpiredPopupVisible(false);
      setWasTokenExpiredShowed(false); // Reset the flag when we're back to safe time
    }
  }, [timeLeft, wasTokenExpiredShowed]);

  // Validate token on component mount (page refresh/reload)
  useEffect(() => {
    // Usar un pequeño timeout para evitar actualizaciones durante el render
    const timeoutId = setTimeout(() => {
      validateToken();
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []); // Only runs once when component mounts

  // Handle validation errors
  useEffect(() => {
    if (isError) {
      // Usar un pequeño timeout para evitar actualizaciones durante el render
      const timeoutId = setTimeout(() => {
        handleLogout();
      }, 0);
      
      return () => clearTimeout(timeoutId);
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
