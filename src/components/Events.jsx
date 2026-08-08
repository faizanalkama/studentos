import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion } from "framer-motion";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", date: "", category: "Personal" });

  const colRef = collection(db, "users", auth.currentUser.uid, "events");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(colRef, form);
    setForm({ title: "", date: "", category: "Personal" });
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm">
          {["Birthday","Exam","Fees","Interview","Personal","Club"].map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>Add</button>
      </form>
      <motion.ul layout>
        {events.map((e) => (
          <motion.li layout key={e.id} className="text-sm mb-1">{e.date} — {e.title} ({e.category})</motion.li>
        ))}
      </motion.ul>
    </div>
  );
}