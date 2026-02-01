import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function AdminRoute() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) return null; // or spinner

  if (!user) return <Navigate to="/login" replace />;

  // Allowed roles for admin panel
  if (user.role_name !== "admin" && user.role_id !== 1) {
    return <Navigate to="/driver" replace />;
  }

  return <Outlet />;
}
