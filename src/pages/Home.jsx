import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { getAISummary } from "../services/aiSummary";
import { useCollection } from "../hooks/useCollection";

const SECTIONS = [
  { key: "weather", icon: "🌤", color: "#5B8FB9" },
  { key: "routine", icon: "📚", color: "#8A7FD6" },
  { key: "assignments", icon: "📝", color: "var(--accent)" },
  { key: "budget", icon: "💰", color: "#D9A441" },
  { key: "medicine", icon: "💊", color: "var(--sage)" },
];

const QUICK_ADD = [
  { label: "Assignment", icon: "📝", to: "/study" },
  { label: "Expense", icon: "💰", to: "/budget" },
  { label: "Event", icon: "📅", to: "/calendar" },
  { label: "Medicine", icon: "💊", to: "/health" },
  { label: "Smart Capture", icon: "✨", to: "/capture" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayShort = DAYS[(new Date().getDay() + 6) % 7];
const todayKey = new Date().toDateString();

export default function Home({ user }) {
  const [greeting, setGreeting] = useState("");
  const [weather, setWeather] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(6000);

  // Shared listeners — same data Timetable/Assignments/Medicines/Budget/Events
  // use when their pages are open. No duplicate connections anymore.
  const classesData = useCollection("timetable");
  const assignmentsData = useCollection("assignments");
  const medicinesData = useCollection("medicines");
  const expensesData = useCollection("expenses");
  const eventsData = useCollection("events");

  const uid = auth.currentUser.uid;
  const summaryCacheRef = doc(db, "users", uid, "aiSummaryCache", "today");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 5 ? "Good Night" : hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : hour < 21 ? "Good Evening" : "Good Night");
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
    getDoc(doc(db, "users", uid, "settings", "budget")).then((snap) => {
      if (snap.exists()) setMonthlyBudget(snap.data().monthlyBudget);
    });
  }, [uid]);

  const today = new Date();
  const todaySpent = expensesData.filter((e) => new Date(e.date).toDateString() === today.toDateString())
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const monthSpent = expensesData.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetInfo = { monthlyBudget, todaySpent, monthSpent, remaining: monthlyBudget - monthSpent };
  const todaysClasses = classesData.filter((c) => c.day === todayShort).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  const dueSoon = assignmentsData.filter((a) => !a.completed).slice(0, 5);
  const upcomingEvents = [...eventsData]
    .filter((e) => new Date(e.date) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  useEffect(() => {
    getDoc(summaryCacheRef).then((snap) => {
      if (snap.exists() && snap.data().date === todayKey) setAiSummary(snap.data().summary);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateSummary = async () => {
    if (!weather) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const result = await getAISummary({ classes: todaysClasses, assignments: dueSoon, weather, budgetInfo, medicines: medicinesData });
      if (result) {
        setAiSummary(result);
        await setDoc(summaryCacheRef, { date: todayKey, summary: result });
      } else setAiError(true);
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!weather || aiSummary) return;
    generateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest font-semibold" style={{ color: "var(--accent)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold mt-1 break-words">
            {greeting}, {user.displayName?.split(" ")[0]}
          </h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="relative p-4 sm:p-6 rounded-2xl mb-6"
        style={{ background: "var(--focus-bg)", color: "var(--focus-text)", boxShadow: "var(--shadow-lift)" }}
      >
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--accent)" }}>
            ✨ Today's Briefing
          </span>
          <button onClick={generateSummary} disabled={aiLoading} className="text-xs font-medium px-2.5 py-1.5 rounded-full disabled:opacity-40" style={{ background: "rgba(255,255,255,0.08)" }}>
            {aiLoading ? "..." : "🔄 Refresh"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {aiError ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-display text-lg">Couldn't generate your briefing right now.</p>
              <button onClick={generateSummary} className="text-xs mt-2 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>Try again</button>
            </motion.div>
          ) : !aiSummary ? (
            <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-lg">Thinking about your day…</motion.p>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p className="font-display text-lg sm:text-xl font-semibold mb-3">{aiSummary.greeting}</p>
              <div className="flex flex-col gap-2">
                {SECTIONS.map(({ key, icon, color }) => (
                  <div key={key} className="flex items-start gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.06)", borderLeft: `3px solid ${color}` }}>
                    <span className="text-base leading-none mt-0.5">{icon}</span>
                    <p className="text-sm opacity-95">{aiSummary[key]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl px-3 py-2.5 font-semibold text-sm text-white" style={{ background: "var(--accent)" }}>
                ⭐ Priority: {aiSummary.priority}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Card title="🌤 Weather" delay={0}>
          {weather ? (
            <div>
              <p className="text-xl font-semibold">{Math.round(weather.main.temp)}°C</p>
              <p className="text-xs capitalize opacity-70">{weather.weather[0].description}</p>
            </div>
          ) : "Loading…"}
        </Card>
        <Card title="💰 Budget" delay={0.05} link="/budget">
          <p className="text-xl font-semibold">₹{budgetInfo.remaining}</p>
          <p className="text-xs opacity-60">of ₹{monthlyBudget} left</p>
        </Card>
        <Card title="💊 Medicine" delay={0.1} link="/health">
          {medicinesData.length === 0 ? (
            <p className="text-xs opacity-50">No medicines set</p>
          ) : (
            <p className="text-xs opacity-70">{medicinesData.filter((m) => m.lastTakenDate !== todayKey).length} pending today</p>
          )}
        </Card>
      </div>

      <Section title="📚 Today's Schedule" link="/study">
        {todaysClasses.length === 0 ? <Empty text="No classes today." /> : (
          <div className="flex flex-col gap-2">
            {todaysClasses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 card-elevated">
                <span className="font-mono text-xs opacity-60">{c.startTime}</span>
                <span className="font-medium">{c.subject}</span>
                {c.room && <span className="opacity-50 text-xs">· {c.room}</span>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="📝 Assignments" link="/study">
        {dueSoon.length === 0 ? <Empty text="Nothing due right now." /> : (
          <div className="flex flex-col gap-2">
            {dueSoon.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 card-elevated">
                <span className="font-medium">{a.subject}</span>
                <span className="opacity-60">— {a.title}</span>
                <span className="ml-auto text-xs opacity-50">due {a.deadline}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="🎂 Upcoming Events" link="/calendar">
        {upcomingEvents.length === 0 ? <Empty text="Nothing coming up." /> : (
          <div className="flex flex-col gap-2">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 card-elevated">
                <span className="font-medium">{e.title}</span>
                <span className="ml-auto text-xs opacity-50">{e.date} · {e.category}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-8 z-30">
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="mb-3 rounded-2xl p-2 flex flex-col gap-1 card-elevated"
              style={{ boxShadow: "var(--shadow-lift)" }}
            >
              {QUICK_ADD.map((q) => (
                <Link key={q.label} to={q.to} onClick={() => setShowQuickAdd(false)} className="text-sm px-3 py-2 rounded-xl hover:opacity-70 whitespace-nowrap">
                  {q.icon} {q.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowQuickAdd((v) => !v)}
          className="w-14 h-14 rounded-full text-white text-2xl flex items-center justify-center"
          style={{ background: "var(--accent)", boxShadow: "var(--shadow-lift)" }}
        >
          {showQuickAdd ? "×" : "+"}
        </motion.button>
      </div>
    </div>
  );
}

function Card({ title, children, delay, link }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl p-4 h-full card-elevated"
    >
      <h3 className="text-xs font-semibold mb-1.5 opacity-70">{title}</h3>
      {children}
    </motion.div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

function Section({ title, link, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {link && <Link to={link} className="text-xs opacity-50 hover:opacity-100 underline underline-offset-2">See all</Link>}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm opacity-40">{text}</p>;
}