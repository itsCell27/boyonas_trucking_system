// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute() {
  const { user, loadingAuth } = useAuth();

  // Prevent flicker while checking session
  if (loadingAuth) return null; // or a loading spinner

  // User is NOT logged in
  if (!user) return <Navigate to="/login" replace />;

  // User is logged in → allow route
  return <Outlet />;
}
