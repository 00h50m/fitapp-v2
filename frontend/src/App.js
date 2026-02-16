import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, StudentRoute, PublicRoute } from "@/components/auth/ProtectedRoutes";

// Pages
import LoginPage from "@/pages/LoginPage";
import StudentDashboard from "@/pages/student/StudentDashboard";

// Admin Pages
import DashboardPage from "@/pages/admin/DashboardPage";
import AdminAlunosPage from "@/pages/admin/AdminAlunosPage";
import ExerciciosPage from "@/pages/admin/ExerciciosPage";

// Home Router - redirects based on role
const HomeRouter = () => {
  const { isAdmin, isStudent, loading } = useAuth();

  if (loading) return null;

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />

      {/* Home - redirects based on role */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomeRouter />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
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

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
        toastOptions={{
          classNames: {
            toast: 'bg-card border-border',
            title: 'text-foreground',
            description: 'text-muted-foreground',
          }
        }}
      />
    </div>
  );
}

export default App;
