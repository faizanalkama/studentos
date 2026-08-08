import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "../hooks/useCollection";

export default function Assignments() {
  const assignments = useCollection("assignments");
  const [form, setForm] = useState({ subject: "", title: "", deadline: "" });
  const colRef = collection(db, "users", auth.currentUser.uid, "assignments");

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(colRef, { ...form, completed: false });
    setForm({ subject: "", title: "", deadline: "" });
  };

  const toggleDone = (id, completed) =>
    updateDoc(doc(db, "users", auth.currentUser.uid, "assignments", id), { completed: !completed });

  const handleDelete = (id) => deleteDoc(doc(db, "users", auth.currentUser.uid, "assignments", id));

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Subject" value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input placeholder="Assignment name" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input type="date" value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>Add</button>
      </form>

      <ul>
        {assignments.length === 0 && <li className="text-sm text-[var(--ink)]/50">No assignments yet</li>}
        <AnimatePresence initial={false}>
          {assignments.map((a) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-sm mb-1.5"
            >
              <button
                onClick={() => toggleDone(a.id, a.completed)}
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors"
                style={{
                  borderColor: a.completed ? "var(--sage)" : "rgba(36,41,59,0.3)",
                  background: a.completed ? "var(--sage)" : "transparent",
                }}
              />
              <span style={{ opacity: a.completed ? 0.45 : 1, textDecoration: a.completed ? "line-through" : "none" }}>
                {a.subject} — {a.title} (due {a.deadline})
              </span>
              <button onClick={() => handleDelete(a.id)} className="text-xs text-[var(--ink)]/40 hover:text-[var(--accent)] ml-auto">✕</button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}