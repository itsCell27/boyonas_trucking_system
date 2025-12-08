// src/contexts/auth-context.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // On mount, try to fetch current user by calling a small endpoint that verifies session
    const checkSession = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/session_check.php`, {
          withCredentials: true,
          timeout: 5000,
        });
        if (resp.data && resp.data.success) {
          setUser(resp.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkSession();
  }, []);

  const login = (userObj) => {
    setUser(userObj);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout.php`, {}, { withCredentials: true });
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, setUser: login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
