import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider, useAuth } from "./backend/Auth";
function AccountApp() {
  const auth = useAuth();
  return auth.ready ? (
    <App key={auth.storageKey} />
  ) : (
    <main role="status">
      <p>Opening your account…</p>
    </main>
  );
}
import "./style.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AccountApp />
    </AuthProvider>
  </React.StrictMode>,
);
