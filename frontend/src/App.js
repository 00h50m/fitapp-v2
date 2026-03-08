import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, PublicRoute } from "@/components/auth/ProtectedRoutes";
import { Loader2 } from "lucide-react";

// Pages
import LoginPage from "@/pages/LoginPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentWorkoutPage from "@/pages/student/StudentWorkoutPage";

// Admin Pages
import DashboardPage from "@/pages/admin/DashboardPage";
import AdminAlunosPage from "@/pages/admin/AdminAlunosPage";
import ExerciciosPage from "@/pages/admin/ExerciciosPage";

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/alunos"
        element={
          <AdminRoute>
            <AdminAlunosPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/exercicios"
        element={
          <AdminRoute>
            <ExerciciosPage />
          </AdminRoute>
        }
      />

      {/* STUDENT */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* HOME → REDIRECT INTELIGENTE */}
      <Route
        path="/"
        element={<RedirectByRole />}
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

import { useAuth } from "@/contexts/AuthContext";

const RedirectByRole = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/app" replace />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>

      <Toaster
        position="top-center"
        richColors
        closeButton
      />
    </div>
  );
}

export default App;
