import { refreshTokenRequest } from "@/api/api";
import TokenExpiryPopup from "@/components/dialogs/TokenExpiryPopup";
import { AppState, useStore } from "@/hooks/useStore";
import { RefreshTokenResponse } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useStore((state: AppState) => state.auth.isAuthenticated);
  const tokenExpiration = useStore((state: AppState) => state.auth.tokenExpiration);
  const logout = useStore((state: AppState) => state.logout);
  const refreshToken = useStore((state: AppState) => state.refreshToken);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wasTokenExpiredShowed, setWasTokenExpiredShowed] = useState(false);
  const [isTokenExpiredPopupVisible, setIsTokenExpiredPopupVisible] = useState(false);
  const timeToShowTokenExpiredPopup = 85;

  const refreshTokenMutation = useMutation({
    mutationFn: refreshTokenRequest,
    onSuccess: (data: RefreshTokenResponse) => {
      refreshToken(data);
      setWasTokenExpiredShowed(false);
      localStorage.setItem("token", JSON.stringify(data.token));
    },
    onError: (error: AxiosError) => {
      console.error(error);
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          logout();
          localStorage.removeItem("token");
          clearInterval(timer);
          return 0;
        }
        return parseInt(prevTime.toString()) - 1;
      });

      if (timeLeft <= timeToShowTokenExpiredPopup && !wasTokenExpiredShowed && !isTokenExpiredPopupVisible) {
        setIsTokenExpiredPopupVisible(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTokenExpiredPopupVisible, logout, timeLeft, wasTokenExpiredShowed]);

  const handleRenewToken = () => {
    setIsTokenExpiredPopupVisible(false);
    refreshTokenMutation.mutate();
  };

  const handleDismissTokenExpiry = () => {
    setIsTokenExpiredPopupVisible(false);
    setWasTokenExpiredShowed(true);
  };

  useEffect(() => {
    if (tokenExpiration) {
      const currentTime = Date.now();
      const timeUntilExpiration = (tokenExpiration.getTime() - currentTime) / 1000;
      setTimeLeft(timeUntilExpiration);
    }
  }, [tokenExpiration]);

  if (isAuthenticated)
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

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
