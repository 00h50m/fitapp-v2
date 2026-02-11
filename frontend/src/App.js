import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import WorkoutPage from "@/pages/WorkoutPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WorkoutPage />} />
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
