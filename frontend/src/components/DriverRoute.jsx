// src/components/DriverRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function DriverRoute() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) return null;

  if (!user) return <Navigate to="/login" replace />;

  // Allowed roles for driver page
  if (user.role_name !== "driver" && user.role_id !== 2) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
