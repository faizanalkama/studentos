import { useState } from "react";
import Timetable from "../components/Timetable";
import Assignments from "../components/Assignments";
import Notes from "../components/Notes";

const TABS = [
  { key: "timetable", label: "🗓 Timetable" },
  { key: "assignments", label: "📝 Assignments" },
  { key: "notes", label: "🗒 Notes" },
];

export default function Study() {
  const [tab, setTab] = useState("timetable");

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto pb-20">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-4">Study</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="text-sm px-3 py-1.5 rounded-full transition-colors"
            style={
              tab === t.key
                ? { background: "var(--accent)", color: "white" }
                : { border: "1px solid var(--border-color)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        {tab === "timetable" && <Timetable />}
        {tab === "assignments" && <Assignments />}
        {tab === "notes" && <Notes />}
      </div>
    </div>
  );
}
