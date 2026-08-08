import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

const todayStr = new Date().toDateString();

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ name: "", dosage: "", time: "" });

  const colRef = collection(db, "users", auth.currentUser.uid, "medicines");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setMedicines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(colRef, { ...form, lastTakenDate: null });
    setForm({ name: "", dosage: "", time: "" });
  };

  const markTaken = async (id) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid, "medicines", id), {
      lastTakenDate: new Date().toDateString(),
    });
  };

  const undoTaken = async (id) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid, "medicines", id), {
      lastTakenDate: null,
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "medicines", id));
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 flex-wrap">
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input placeholder="Dosage" value={form.dosage}
          onChange={(e) => setForm({ ...form, dosage: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <input type="time" value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm" />
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>Add</button>
      </form>

      <motion.ul layout>
        {medicines.length === 0 && <li className="text-sm text-[var(--ink)]/50">No medicines set yet</li>}
        <AnimatePresence>
          {medicines.map((m) => {
            const takenToday = m.lastTakenDate === todayStr;
            return (
              <motion.li
                layout
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm mb-1.5"
              >
                <button
                  onClick={() => (takenToday ? undoTaken(m.id) : markTaken(m.id))}
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors"
                  style={{
                    borderColor: takenToday ? "var(--sage)" : "rgba(36,41,59,0.3)",
                    background: takenToday ? "var(--sage)" : "transparent",
                  }}
                />
                <span style={{ opacity: takenToday ? 0.5 : 1 }}>
                  {m.name} ({m.dosage}) at {m.time} — {takenToday ? "taken today" : "pending"}
                </span>
                <button onClick={() => handleDelete(m.id)} className="text-xs text-[var(--ink)]/40 hover:text-[var(--accent)] ml-auto">✕</button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}