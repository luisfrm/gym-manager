import { create } from "zustand";
import { AuthState } from "@/lib/types";
import { devtools } from "zustand/middleware";

export interface AppState {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  logout: () => void;
}

const AUTH_INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  user: {
    id: '',
    email: '',
    username: '',
    role: '',
  },
  error: null,
  token: null,
};

export const useStore = create<AppState>()(
  devtools(
    set => ({
      auth: AUTH_INITIAL_STATE,
      setAuth: (auth: AuthState) => set((state)=>({...state, auth})),
      logout: () => set((state)=>({...state, auth: AUTH_INITIAL_STATE})),
    }),
    { name: "AppStore" },
  ),
);
