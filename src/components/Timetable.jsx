import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayShort = DAYS[(new Date().getDay() + 6) % 7];

export default function Timetable() {
  const [classes, setClasses] = useState([]);
  const [addingFor, setAddingFor] = useState(null); // which day's mini-form is open
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ subject: "", startTime: "", endTime: "", room: "" });

  const colRef = collection(db, "users", auth.currentUser.uid, "timetable");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const openAdd = (day) => {
    setAddingFor(day);
    setEditingId(null);
    setForm({ subject: "", startTime: "", endTime: "", room: "" });
  };

  const openEdit = (cls) => {
    setEditingId(cls.id);
    setAddingFor(cls.day);
    setForm({ subject: cls.subject, startTime: cls.startTime, endTime: cls.endTime, room: cls.room || "" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, "users", auth.currentUser.uid, "timetable", editingId), { ...form, day: addingFor });
    } else {
      await addDoc(colRef, { ...form, day: addingFor });
    }
    setAddingFor(null);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "timetable", id));
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {DAYS.map((day) => {
          const dayClasses = classes
            .filter((c) => c.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          const isToday = day === todayShort;

          return (
            <div
              key={day}
              className="rounded-xl p-2"
              style={{
                background: isToday ? "rgba(232,106,92,0.08)" : "transparent",
                border: `1px solid ${isToday ? "var(--accent)" : "var(--border-color)"}`,
              }}
            >
              <p className="text-xs font-semibold text-center mb-2" style={{ color: isToday ? "var(--accent)" : "inherit" }}>
                {day}
              </p>

              <motion.div layout className="flex flex-col gap-1 min-h-[20px]">
                <AnimatePresence>
                  {dayClasses.map((c) => (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs rounded-lg px-1.5 py-1 cursor-pointer group relative"
                      style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                      onClick={() => openEdit(c)}
                    >
                      <p className="font-medium">{c.subject}</p>
                      <p className="opacity-60">{c.startTime}-{c.endTime}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                        className="absolute top-0.5 right-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-xs"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              <button
                onClick={() => openAdd(day)}
                className="text-xs mt-2 w-full text-center py-1 rounded-lg opacity-50 hover:opacity-100"
                style={{ border: "1px dashed var(--border-color)" }}
              >
                + Add
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {addingFor && (
          <motion.form
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onSubmit={handleSave}
            className="flex gap-2 mt-3 flex-wrap items-center text-sm w-full"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", padding: "0.5rem" }}
          >
            <span className="text-xs opacity-60">{editingId ? "Edit" : "Add"} — {addingFor}</span>
            <input placeholder="Subject" required value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="border rounded-lg px-2 py-1 text-sm" />
            <input type="time" required value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="border rounded-lg px-2 py-1 text-sm" />
            <input type="time" required value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="border rounded-lg px-2 py-1 text-sm" />
            <input placeholder="Room (optional)" value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="border rounded-lg px-2 py-1 text-sm w-24" />
            <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>
              Save
            </button>
            <button type="button" onClick={() => { setAddingFor(null); setEditingId(null); }} className="text-sm opacity-50">
              Cancel
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}