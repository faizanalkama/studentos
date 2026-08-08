import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion } from "framer-motion";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ name: "", dosage: "", time: "", repeat: "Daily" });

  const colRef = collection(db, "users", auth.currentUser.uid, "medicines");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setMedicines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(colRef, { ...form, status: "pending" });
    setForm({ name: "", dosage: "", time: "", repeat: "Daily" });
  };

  const markStatus = async (id, status) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid, "medicines", id), { status });
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
        {medicines.map((m) => (
          <motion.li layout key={m.id} className="text-sm mb-1.5">
            {m.name} ({m.dosage}) at {m.time} —{" "}
            <span style={{ color: m.status === "taken" ? "var(--sage)" : "var(--ink)" }}>{m.status}</span>
            <button onClick={() => markStatus(m.id, "taken")} className="ml-2 text-xs underline">Taken</button>
            <button onClick={() => markStatus(m.id, "skipped")} className="ml-2 text-xs underline">Skip</button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}