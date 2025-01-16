import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/ProtectedRouted";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { useQuery } from "@tanstack/react-query";
import { validateTokenRequest } from "./api/api";
import DotSpinner from "./components/DotSpinner";
import { useEffect } from "react";
import { useStore } from "./hooks/useStore";
import useLocalStorage from "./hooks/useLocalStorage";
import ClientDetails from "./pages/ClientDetails";

function App() {
  const { setAuth } = useStore(state => state);
  const [token] = useLocalStorage("token", "");
  const { data, isLoading } = useQuery({
    queryKey: ["validateToken"],
    queryFn: validateTokenRequest,
    retry: false,
    enabled: !!token,
  });

  useEffect(() => {
    if (data) {
      setAuth({
        isAuthenticated: true,
        user: data,
        error: null,
        token: token,
        tokenExpiration: data.tokenExpiration,
      });
    }
  }, [data, setAuth, token]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-dvh">
        <DotSpinner color="bg-sky-600" height="h-3" width="w-3" />
      </div>
    );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:cedula" element={<ClientDetails />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<div>Logout</div>} />
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </Router>
  );
}

export default App;
