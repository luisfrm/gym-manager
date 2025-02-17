import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { AuthState, TokenState } from "@/lib/types";

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
  token: "",
  tokenExpiration: null,
};

export const useStore = create<AppState>()(
  devtools(
    persist(
      set => ({
        auth: AUTH_INITIAL_STATE,
        setAuth: (auth: AuthState) =>
          set(state => ({
            ...state,
            auth,
          })),
        logout: () => {
          set(state => ({ ...state, auth: AUTH_INITIAL_STATE }));
        },
        refreshToken: (tokenRefresh: TokenState) => {
          set(state => ({
            ...state,
            auth: {
              ...state.auth,
              token: tokenRefresh.token,
              tokenExpiration: tokenRefresh.tokenExpiration,
            },
          }));
        },
      }),
      {
        name: "AppStore", // Persist Options
      },
    ),
    {
      name: "AppStore", // DevTools Options
    },
  ),
);
