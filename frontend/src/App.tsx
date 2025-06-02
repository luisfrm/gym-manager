import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ServerInitializingSpinner } from "@/components/ServerInitializingSpinner";
import { pingServer } from "@/api/api";

const Login = lazy(() => import("./pages/Login"));
const ProtectedRoute = lazy(() => import("./pages/ProtectedRouted"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Payments = lazy(() => import("./pages/Payments"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const ClientDetails = lazy(() => import("./pages/ClientDetails"));
const FaceVerification = lazy(() => import("./pages/FaceVerification"));
const Suggestions = lazy(() => import("./pages/Suggestions"));

function App() {
  const [isServerReady, setIsServerReady] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await pingServer();
        setIsServerReady(true);
      } catch (error) {
        console.error("Error verifying server status:", error);
        setTimeout(checkServerStatus, 5000);
      }
    };

    checkServerStatus();
  }, []);

  if (!isServerReady) {
    return <ServerInitializingSpinner />;
  }

  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
          </div>
        }
      >
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
            <Route path="/face-verification" element={<FaceVerification />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/logout" element={<div>Logout</div>} />
          </Route>
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
