import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suprime AbortError do Supabase no StrictMode (double-mount em dev)
const originalUnhandledRejection = window.onunhandledrejection;
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason?.name === "AbortError" ||
    event.reason?.message?.includes("signal is aborted") ||
    event.reason?.message?.includes("aborted without reason")
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  if (originalUnhandledRejection) originalUnhandledRejection(event);
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // StrictMode removido para evitar double-mount que causa AbortError no Supabase
  <App />
);