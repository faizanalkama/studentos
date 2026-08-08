import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
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

const SECTIONS = [
  { key: "weather", icon: "🌤", color: "#5B8FB9" },
  { key: "routine", icon: "📚", color: "#8A7FD6" },
  { key: "assignments", icon: "📝", color: "var(--accent)" },
  { key: "budget", icon: "💰", color: "#D9A441" },
  { key: "medicine", icon: "💊", color: "var(--sage)" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayShort = DAYS[(new Date().getDay() + 6) % 7];
const todayKey = new Date().toDateString();

export default function Dashboard({ user, onLogout }) {
  const [greeting, setGreeting] = useState("");
  const [weather, setWeather] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [classesData, setClassesData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [medicinesData, setMedicinesData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(6000);

  const uid = auth.currentUser.uid;
  const summaryCacheRef = doc(db, "users", uid, "aiSummaryCache", "today");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

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
    const unsubClasses = onSnapshot(query(collection(db, "users", uid, "timetable")), (snap) => {
      setClassesData(snap.docs.map((d) => d.data()));
    });
    const unsubAssignments = onSnapshot(query(collection(db, "users", uid, "assignments")), (snap) => {
      setAssignmentsData(snap.docs.map((d) => d.data()));
    });
    const unsubMedicines = onSnapshot(query(collection(db, "users", uid, "medicines")), (snap) => {
      setMedicinesData(snap.docs.map((d) => d.data()));
    });
    const unsubExpenses = onSnapshot(query(collection(db, "users", uid, "expenses")), (snap) => {
      setExpensesData(snap.docs.map((d) => d.data()));
    });
    getDoc(doc(db, "users", uid, "settings", "budget")).then((snap) => {
      if (snap.exists()) setMonthlyBudget(snap.data().monthlyBudget);
    });
    return () => { unsubClasses(); unsubAssignments(); unsubMedicines(); unsubExpenses(); };
  }, []);

  const today = new Date();
  const todaySpent = expensesData.filter((e) => new Date(e.date).toDateString() === today.toDateString())
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const monthSpent = expensesData.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetInfo = { monthlyBudget, todaySpent, monthSpent, remaining: monthlyBudget - monthSpent };
  const todaysClasses = classesData.filter((c) => c.day === todayShort);

  // Load a cached summary (if generated earlier today) as soon as we know who's logged in —
  // this is what makes the dashboard feel instant on reload instead of waiting on Gemini every time.
  useEffect(() => {
    getDoc(summaryCacheRef).then((snap) => {
      if (snap.exists() && snap.data().date === todayKey) {
        setAiSummary(snap.data().summary);
      }
    });
  }, []);

  const generateSummary = async () => {
    if (!weather) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const result = await getAISummary({
        classes: todaysClasses,
        assignments: assignmentsData,
        weather,
        budgetInfo,
        medicines: medicinesData,
      });
      if (result) {
        setAiSummary(result);
        await setDoc(summaryCacheRef, { date: todayKey, summary: result });
      } else {
        setAiError(true);
      }
    } catch (err) {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-generate once per day, only if there's no cached summary yet — not on every data edit.
  useEffect(() => {
    if (!weather || aiSummary) return;
    generateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[var(--accent)] font-semibold">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-semibold mt-1 break-words">
            {greeting}, {user.displayName?.split(" ")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button onClick={toggleTheme} className="text-xs sm:text-sm px-3 py-1.5 rounded-full whitespace-nowrap" style={{ border: "1px solid var(--border-color)" }}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button onClick={onLogout} className="text-xs sm:text-sm text-[var(--ink)]/50 hover:text-[var(--ink)] transition-colors underline underline-offset-4 whitespace-nowrap">
            Logout
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: -0.5 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        whileHover={{ rotate: 0, scale: 1.01 }}
        className="relative p-4 sm:p-6 rounded-2xl mb-8 shadow-lg"
        style={{ background: "var(--focus-bg)", color: "var(--focus-text)", boxShadow: "0 12px 30px -10px rgba(0,0,0,0.4)" }}
      >
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--accent)" }}>
            🤖 Today's Focus
          </span>
          <motion.button
            onClick={generateSummary}
            disabled={aiLoading}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1.5 disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.08)", color: "var(--focus-text)" }}
          >
            <motion.span
              animate={aiLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={aiLoading ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
            >
              🔄
            </motion.span>
            {aiLoading ? "" : "Refresh"}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {aiError ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-display text-lg">Couldn't generate your summary right now.</p>
              <button onClick={generateSummary} className="text-xs mt-2 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                Try again
              </button>
            </motion.div>
          ) : !aiSummary ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <p className="font-display text-lg">Thinking about your day</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--focus-text)" }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <p className="font-display text-lg sm:text-xl font-semibold mb-3">{aiSummary.greeting}</p>
              <motion.div
                className="flex flex-col gap-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              >
                {SECTIONS.map(({ key, icon, color }) => (
                  <motion.div
                    key={key}
                    variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="flex items-start gap-2 rounded-xl px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.06)", borderLeft: `3px solid ${color}` }}
                  >
                    <span className="text-base leading-none mt-0.5">{icon}</span>
                    <p className="text-sm opacity-95">{aiSummary[key]}</p>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-4 rounded-xl px-3 py-2.5 font-semibold text-sm text-white"
                style={{ background: "var(--accent)" }}
              >
                ⭐ Priority: {aiSummary.priority}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="dashboard-grid">
        <Card title="🌤 Weather" variants={cardVariant} area="weather">
          {weather ? (
            <div>
              <p className="text-2xl font-semibold">{Math.round(weather.main.temp)}°C</p>
              <p className="capitalize">{weather.weather[0].description}</p>
            </div>
          ) : "Loading weather..."}
        </Card>
        <Card title="💰 Budget Remaining" variants={cardVariant} area="budget"><Budget /></Card>
        <Card title="💊 Medicines Today" variants={cardVariant} area="medicine"><Medicines /></Card>
        <Card title="📚 Today's Classes" variants={cardVariant} area="timetable"><Timetable /></Card>
        <Card title="📝 Assignments Due" variants={cardVariant} area="assignments"><Assignments /></Card>
        <Card title="🎂 Upcoming Events" variants={cardVariant} area="events"><Events /></Card>
      </motion.div>
    </div>
  );
}

function Card({ title, children, variants, area }) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
      className={`rounded-2xl p-5 shadow-sm transition-colors duration-300 hover:border-[var(--accent)]/50 ${area ? `area-${area}` : ""}`}
      style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
    >
      <h2 className="font-display text-lg font-semibold mb-2">{title}</h2>
      <div className="text-sm text-[var(--ink)]/70">{children}</div>
    </motion.div>
  );
}