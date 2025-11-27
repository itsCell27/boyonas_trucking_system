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
import { ThemeContextProvider } from '@/context/ThemeContext'
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/reset_password" element={<ResetPassword />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route path="/test" element={<Test />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/*" element={<App />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-center"/>
      </BrowserRouter>
    </ThemeContextProvider>
  </StrictMode>,
)
