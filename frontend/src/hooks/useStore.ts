import { create } from "zustand";
import { AuthState } from "@/lib/types";
import { devtools } from "zustand/middleware";

interface AppState {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
}

const AUTH_INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
  token: null,
};

export const useStore = create<AppState>()(
  devtools(
    set => ({
      auth: AUTH_INITIAL_STATE,
      setAuth: (auth: AuthState) => set((state)=>({...state, auth})),
    }),
    { name: "AppStore" },
  ),
);
