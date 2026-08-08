import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "../hooks/useCollection";

const todayKey = new Date().toDateString();

export default function Notifications() {
  const uid = auth.currentUser.uid;
  const assignments = useCollection("assignments");
  const medicines = useCollection("medicines");
  const events = useCollection("events");
  const expenses = useCollection("expenses");
  const [monthlyBudget, setMonthlyBudget] = useState(6000);

  useEffect(() => {
    getDoc(doc(db, "users", uid, "settings", "budget")).then((snap) => {
      if (snap.exists()) setMonthlyBudget(snap.data().monthlyBudget);
    });
  }, [uid]);

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const notifications = [];

  assignments.forEach((a) => {
    if (a.completed) return;
    if (a.deadline === tomorrow.toISOString().slice(0, 10) || a.deadline === today.toISOString().slice(0, 10)) {
      notifications.push({ icon: "📝", text: `${a.subject} — ${a.title} due ${a.deadline === today.toISOString().slice(0, 10) ? "today" : "tomorrow"}` });
    }
  });

  medicines.forEach((m) => {
    if (m.lastTakenDate !== todayKey) {
      notifications.push({ icon: "💊", text: `${m.name} (${m.dosage}) at ${m.time}` });
    }
  });

  events.forEach((e) => {
    if (e.date === tomorrow.toISOString().slice(0, 10)) {
      notifications.push({ icon: e.category === "Birthday" ? "🎂" : "📅", text: `${e.title} tomorrow` });
    }
  });

  const monthSpent = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  if (monthlyBudget > 0 && monthSpent / monthlyBudget >= 0.85) {
    notifications.push({ icon: "💰", text: `You've used ${Math.round((monthSpent / monthlyBudget) * 100)}% of your monthly budget` });
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-2xl mx-auto pb-20">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-6">🔔 Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-sm opacity-50">Nothing needs your attention right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {notifications.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="flex items-center gap-3 text-sm rounded-xl px-4 py-3 card-elevated"
              >
                <span className="text-lg">{n.icon}</span>
                <span>{n.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}