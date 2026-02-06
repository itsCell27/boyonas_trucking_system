// src/components/DriverRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function DriverRoute() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) return null;

  if (!user) return <Navigate to="/login" replace />;

  // Allow if user is driver (role_id 2) OR helper (role_id 3)
  const isDriverOrHelper = user.role_id === 2 || user.role_id === 3;

  if (!isDriverOrHelper) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
