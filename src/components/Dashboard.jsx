import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Timetable from "./Timetable";
import Budget from "./Budget";
import Assignments from "./Assignments";
import Medicines from "./Medicines";
import Events from "./Events";
import { getAISummary } from "../services/aiSummary";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, rotate: -1 },
  show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export default function Dashboard({ user, onLogout }) {
  const [greeting, setGreeting] = useState("");
  const [weather, setWeather] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      setWeather(await res.json());
    });
  }, []);

  useEffect(() => {
    if (!weather) return; // wait until weather has loaded first

    getAISummary({
      classes: [],       // wire in real timetable data later if time allows
      assignments: [],   // same for assignments
      weather: weather,
      budget: 6000,       // hardcoded for now, matches Budget.jsx
      medicines: [],
    }).then((result) => {
      setAiSummary(result);
    });
  }, [weather]);

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <p className="text-sm uppercase tracking-widest text-[var(--accent)] font-semibold">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-1">
            {greeting}, {user.displayName?.split(" ")[0]}
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-[var(--ink)]/50 hover:text-[var(--ink)] transition-colors underline underline-offset-4"
        >
          Logout
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: -0.5 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        whileHover={{ rotate: 0, scale: 1.01 }}
        className="relative text-[var(--paper)] p-6 rounded-2xl mb-8 shadow-lg"
        style={{ background: "var(--ink)", boxShadow: "0 12px 30px -10px rgba(36,41,59,0.35)" }}
      >
        <span className="absolute -top-3 left-6 text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--accent)" }}>
          🤖 Today's Focus
        </span>
        <p className="font-display text-lg md:text-xl leading-relaxed mt-2">
          {aiSummary || "Thinking about your day..."}
        </p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card title="🌤 Weather" variants={cardVariant}>
          {weather ? (
            <div>
              <p className="text-2xl font-semibold">{Math.round(weather.main.temp)}°C</p>
              <p className="capitalize">{weather.weather[0].description}</p>
            </div>
          ) : (
            "Loading weather..."
          )}
        </Card>
        <Card title="📚 Today's Classes" variants={cardVariant}><Timetable /></Card>
        <Card title="📝 Assignments Due" variants={cardVariant}><Assignments /></Card>
        <Card title="💰 Budget Remaining" variants={cardVariant}><Budget /></Card>
        <Card title="💊 Medicines Today" variants={cardVariant}><Medicines /></Card>
        <Card title="🎂 Upcoming Events" variants={cardVariant}><Events /></Card>
      </motion.div>
    </div>
  );
}

function Card({ title, children, variants }) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, boxShadow: "0 16px 30px -12px rgba(36,41,59,0.18)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--ink)]/5"
    >
      <h2 className="font-display text-lg font-semibold mb-2">{title}</h2>
      <div className="text-sm text-[var(--ink)]/70">{children}</div>
    </motion.div>
  );
}