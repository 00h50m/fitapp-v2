import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Student Pages (Mobile-first)
import WorkoutPage from "@/pages/WorkoutPage";

// Admin Pages (Desktop-first)
import { DashboardPage, AlunosPage, ExerciciosPage } from "@/pages/admin";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* ===== ÁREA DO ALUNO (Mobile-first) ===== */}
          <Route path="/" element={<WorkoutPage />} />
          
          {/* ===== ÁREA ADMINISTRATIVA (Desktop-first) ===== */}
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/alunos" element={<AlunosPage />} />
          <Route path="/admin/exercicios" element={<ExerciciosPage />} />
          
          {/* Redirect unknown admin routes to dashboard */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
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
