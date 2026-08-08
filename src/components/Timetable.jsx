import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion } from "framer-motion";

export default function Timetable() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ subject: "", day: "", startTime: "", endTime: "", room: "" });

  const colRef = collection(db, "users", auth.currentUser.uid, "timetable");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(colRef, form);
    setForm({ subject: "", day: "", startTime: "", endTime: "", room: "" });
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Subject" value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm">
          <option value="">Day</option>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="time" value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input type="time" value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>Add</button>
      </form>
      <motion.ul layout>
        {classes.map((c) => (
          <motion.li layout key={c.id} className="text-sm mb-1">
            {c.day} — {c.subject} ({c.startTime}-{c.endTime})
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}