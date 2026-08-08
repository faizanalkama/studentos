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
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--focus-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-2" style={{ color: "var(--focus-text)" }}>
          StudentOS
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--focus-text)", opacity: 0.6 }}>
          Your day, organized by AI.
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleLogin}
          className="px-6 py-3 rounded-xl font-semibold"
          style={{ background: "var(--accent)", color: "white", boxShadow: "var(--shadow-lift)" }}
        >
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
}