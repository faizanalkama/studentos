import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ subject: "", title: "", deadline: "" });

  const colRef = collection(db, "users", auth.currentUser.uid, "assignments");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(colRef, { ...form, completed: false });
    setForm({ subject: "", title: "", deadline: "" });
  };

  const toggleDone = async (id, completed) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid, "assignments", id), { completed: !completed });
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Subject" value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input type="date" value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>Add</button>
      </form>
      <motion.ul layout>
        {assignments.map((a) => (
          <motion.li layout key={a.id} className="flex items-center gap-2 text-sm mb-1.5">
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
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}