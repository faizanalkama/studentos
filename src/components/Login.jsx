import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { motion } from "framer-motion";

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--ink)" }}>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogin}
        className="bg-[var(--paper)] text-[var(--ink)] px-6 py-3 rounded-xl font-semibold shadow-lg"
      >
        Sign in with Google
      </motion.button>
    </div>
  );
}