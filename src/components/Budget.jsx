import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion } from "framer-motion";

export default function Budget() {
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget] = useState(6000);
  const [form, setForm] = useState({ amount: "", category: "Food" });

  const colRef = collection(db, "users", auth.currentUser.uid, "expenses");

  useEffect(() => {
    const unsub = onSnapshot(query(colRef), (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = monthlyBudget - totalSpent;
  const pct = Math.min((totalSpent / monthlyBudget) * 100, 100);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(colRef, { ...form, amount: Number(form.amount), date: new Date().toISOString() });
    setForm({ amount: "", category: "Food" });
  };

  return (
    <div>
      <p className="font-semibold mb-2">₹{remaining} remaining of ₹{monthlyBudget}</p>
      <div className="h-2 w-full rounded-full overflow-hidden mb-3" style={{ background: "rgba(36,41,59,0.1)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct > 85 ? "var(--accent)" : "var(--sage)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input type="number" placeholder="Amount" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm w-24" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm">
          {["Food","Transport","Snacks","Shopping","Other"].map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>Add</button>
      </form>
    </div>
  );
}