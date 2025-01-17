import { create } from "zustand";
import { AuthState, TokenState } from "@/lib/types";
import { devtools } from "zustand/middleware";

export interface AppState {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  logout: () => void;
  refreshToken: (state: TokenState) => void;
}

const AUTH_INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
  token: null,
  tokenExpiration: null,
};

export const useStore = create<AppState>()(
  devtools(
    set => ({
      auth: AUTH_INITIAL_STATE,
      setAuth: (auth: AuthState) =>
        set(state => ({
          ...state,
          auth: { ...auth, tokenExpiration: new Date(auth.tokenExpiration?.toString() ?? "") },
        })),
      logout: () => {
        set(state => ({ ...state, auth: AUTH_INITIAL_STATE }));
        localStorage.removeItem("token");
      },
      refreshToken: (tokenRefresh: TokenState) => {
        set(state => ({
          ...state,
          auth: {
            ...state.auth,
            token: tokenRefresh.token,
            tokenExpiration: new Date(tokenRefresh.tokenExpiration.toString() ?? ""),
          },
        }));
      },
    }),
    { name: "AppStore" },
  ),
);
