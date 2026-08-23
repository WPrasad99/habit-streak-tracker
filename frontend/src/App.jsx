// src/App.jsx
// Root component: routing + providers

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HabitsPage from './pages/HabitsPage.jsx';
import HabitDetailPage from './pages/HabitDetailPage.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/habits" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage mode="login" />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <LoginPage mode="register" />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/habits"
        element={
          <ProtectedRoute>
            <HabitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/habits/:id"
        element={
          <ProtectedRoute>
            <HabitDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/habits" replace />} />
      <Route path="*" element={<Navigate to="/habits" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
