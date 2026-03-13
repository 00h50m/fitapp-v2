import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suprimir AbortError silencioso do Supabase no StrictMode
window.addEventListener("unhandledrejection", (event) => {
  const msg = event?.reason?.message || "";
  if (
    event?.reason?.name === "AbortError" ||
    msg.includes("aborted") ||
    msg.includes("AbortError") ||
    msg.includes("signal is aborted")
  ) {
    event.preventDefault();
  }
});

// Suprimir AbortError no overlay do CRA (error boundary do webpack-dev-server)
window.addEventListener("error", (event) => {
  const msg = event?.message || "";
  if (
    msg.includes("AbortError") ||
    msg.includes("signal is aborted") ||
    msg.includes("aborted without reason")
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

// SEM StrictMode — evita dupla montagem que causa AbortError
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);