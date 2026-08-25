import React from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Landing from "./routes/Landing";
import AccessPortal from "./routes/AccessPortal";
import AdminPanel from "./routes/AdminPanel";
import AppConsole from "./routes/AppConsole";
import InviteAccept from "./routes/InviteAccept";
import TalentApplication from "./routes/TalentApplication";
import PwaUpdateBanner from "./components/PwaUpdateBanner";

import "./styles.css";

function AppEntry() {
  const location = useLocation();
  const source = new URLSearchParams(location.search).get("source") || "";

  if (source.startsWith("pwa")) {
    return <Navigate to="/?source=pwa&experience=immersive&v=16" replace />;
  }

  return <AppConsole />;
}

export default function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      <PwaUpdateBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/access" element={<AccessPortal />} />
        <Route path="/talentos/candidatura" element={<TalentApplication />} />
        <Route path="/app" element={<AppEntry />} />
        <Route path="/invite/:token" element={<InviteAccept />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
