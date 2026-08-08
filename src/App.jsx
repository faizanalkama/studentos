import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div key="login" exit={{ opacity: 0 }}>
          <Login />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Dashboard user={user} onLogout={() => signOut(auth)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}