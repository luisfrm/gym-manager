import { refreshTokenRequest } from "@/api/api";
import TokenExpiryPopup from "@/components/dialogs/TokenExpiryPopup";
import { AppState, useStore } from "@/hooks/useStore";
import { RefreshTokenResponse } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState, useEffect, useRef } from "react";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, tokenExpiration } = useStore((state: AppState) => state.auth);
  const { logout, refreshToken } = useStore((state: AppState) => state);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wasTokenExpiredShowed, setWasTokenExpiredShowed] = useState(false);
  const [isTokenExpiredPopupVisible, setIsTokenExpiredPopupVisible] = useState(false);
  const timeToShowTokenExpiredPopup = 85;
  const timeLeftRef = useRef(timeLeft);

  const refreshTokenMutation = useMutation({
    mutationFn: refreshTokenRequest,
    onSuccess: (data: RefreshTokenResponse) => {
      refreshToken(data);
      setWasTokenExpiredShowed(false);
    },
    onError: (error: AxiosError) => {
      console.error(error);
      logout();
    },
  });

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

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

      if (timeLeftRef.current <= timeToShowTokenExpiredPopup && !wasTokenExpiredShowed && !isTokenExpiredPopupVisible) {
        setIsTokenExpiredPopupVisible(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTokenExpiredPopupVisible, logout, wasTokenExpiredShowed]);

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
      const expirationDate = new Date(tokenExpiration);
      const currentTime = Date.now();
      const timeUntilExpiration = (expirationDate.getTime() - currentTime) / 1000;
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
