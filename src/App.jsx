import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import Study from "./pages/Study";
import Budget from "./components/Budget";
import Health from "./pages/Health";
import Calendar from "./pages/Calendar";
import SmartCapture from "./pages/SmartCapture";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--paper)" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--accent) transparent transparent transparent" }} />
      </div>
    );
  }
  if (!user) return <Login />;

  const onLogout = () => signOut(auth);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <NavBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home user={user} onLogout={onLogout} /></PageTransition>} />
          <Route path="/study" element={<PageTransition><Study /></PageTransition>} />
          <Route path="/budget" element={<PageTransition><PageShell title="💰 Budget"><Budget /></PageShell></PageTransition>} />
          <Route path="/health" element={<PageTransition><Health /></PageTransition>} />
          <Route path="/calendar" element={<PageTransition><Calendar /></PageTransition>} />
          <Route path="/capture" element={<PageTransition><SmartCapture /></PageTransition>} />
          <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings user={user} onLogout={onLogout} /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function PageShell({ title, children }) {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-6">{title}</h1>
      {children}
    </div>
  );
}