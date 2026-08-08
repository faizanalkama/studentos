import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", category: "Personal" });

  const colRef = collection(db, "users", auth.currentUser.uid, "events");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, "users", auth.currentUser.uid, "events", editingId), form);
      setEditingId(null);
    } else {
      await addDoc(colRef, form);
    }
    setForm({ title: "", date: "", category: "Personal" });
  };

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setForm({ title: ev.title, date: ev.date, category: ev.category });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "events", id));
    if (editingId === id) { setEditingId(null); setForm({ title: "", date: "", category: "Personal" }); }
  };

  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <form onSubmit={handleSave} className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <select value={["Birthday", "Exam", "Fees", "Interview", "Personal", "Club"].includes(form.category) ? form.category : "__custom__"}
          onChange={(e) => {
            if (e.target.value === "__custom__") setForm({ ...form, category: "" });
            else setForm({ ...form, category: e.target.value });
          }}
          className="border rounded-lg px-2 py-1 text-sm">
          {["Birthday", "Exam", "Fees", "Interview", "Personal", "Club"].map((c) => <option key={c}>{c}</option>)}
          <option value="__custom__">+ Custom...</option>
        </select>
        {(!["Birthday", "Exam", "Fees", "Interview", "Personal", "Club"].includes(form.category)) && (
          <input
            placeholder="Custom category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border rounded-lg px-2 py-1 text-sm w-28"
          />
        )}
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", date: "", category: "Personal" }); }} className="text-sm opacity-50">
            Cancel
          </button>
        )}
      </form>

      <motion.ul layout>
        {sorted.length === 0 && <li className="text-sm text-[var(--ink)]/50">No events yet</li>}
        <AnimatePresence>
          {sorted.map((e) => (
            <motion.li layout key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm mb-1.5">
              <span>{e.date} — {e.title} ({e.category})</span>
              <button onClick={() => startEdit(e)} className="text-xs text-[var(--ink)]/40 hover:text-[var(--accent)] ml-auto">Edit</button>
              <button onClick={() => handleDelete(e.id)} className="text-xs text-[var(--ink)]/40 hover:text-[var(--accent)]">✕</button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}