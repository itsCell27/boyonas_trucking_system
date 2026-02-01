import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Login from '@/pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Test from '@/Test'
import ForgotPassword from '@/pages/ForgotPassword.jsx';
import ResetPassword from '@/pages/ResetPassword.jsx';
import ConfirmEmailChange from '@/pages/ConfirmEmailChange.jsx';
import { ThemeContextProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext.jsx';
import AdminRoute from '@/components/AdminRoute.jsx';
import DriverRoute from '@/components/DriverRoute.jsx';
import DriverPortal from '@/driverPages/Driver.jsx';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeContextProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/reset_password" element={<ResetPassword />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/test" element={<Test />} />
            <Route path="/confirm_email_change" element={<ConfirmEmailChange />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />

            {/* ADMIN-ONLY ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminRoute />}>
                <Route path="/app/*" element={<App />} />
              </Route>
            </Route>

            {/* DRIVER-ONLY ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DriverRoute />}>
                <Route path="/driver" element={<DriverPortal />} />
              </Route>
            </Route>
          </Routes>
          <Toaster richColors position="top-center"/>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  </StrictMode>,
)
