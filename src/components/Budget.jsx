import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function Budget() {
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(6000);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [form, setForm] = useState({ amount: "", category: "Food" });
  const [showList, setShowList] = useState(false);

  const uid = auth.currentUser.uid;
  const expensesRef = collection(db, "users", uid, "expenses");
  const settingsRef = doc(db, "users", uid, "settings", "budget");

  useEffect(() => {
    getDoc(settingsRef).then((snap) => {
      if (snap.exists()) setMonthlyBudget(snap.data().monthlyBudget);
      else setDoc(settingsRef, { monthlyBudget: 6000 });
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(expensesRef), (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const today = new Date();
  const todaySpent = expenses.filter((e) => new Date(e.date).toDateString() === today.toDateString())
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const monthSpent = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).reduce((sum, e) => sum + Number(e.amount), 0);

  const remaining = monthlyBudget - monthSpent;
  const pct = Math.min((monthSpent / monthlyBudget) * 100, 100);

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (editingExpenseId) {
      await updateDoc(doc(db, "users", uid, "expenses", editingExpenseId), {
        amount: Number(form.amount),
        category: form.category,
      });
      setEditingExpenseId(null);
    } else {
      await addDoc(expensesRef, { ...form, amount: Number(form.amount), date: new Date().toISOString() });
    }
    setForm({ amount: "", category: "Food" });
  };

  const startEditExpense = (exp) => {
    setEditingExpenseId(exp.id);
    setForm({ amount: exp.amount, category: exp.category });
    setShowList(true);
  };

  const handleDeleteExpense = async (id) => {
    await deleteDoc(doc(db, "users", uid, "expenses", id));
    if (editingExpenseId === id) { setEditingExpenseId(null); setForm({ amount: "", category: "Food" }); }
  };

  const saveBudget = async () => {
    const value = Number(budgetInput);
    if (!value || value <= 0) return;
    await setDoc(settingsRef, { monthlyBudget: value });
    setMonthlyBudget(value);
    setEditingBudget(false);
    setBudgetInput("");
  };

  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold">₹{remaining} remaining of ₹{monthlyBudget}</p>
        <button onClick={() => setEditingBudget(!editingBudget)} className="text-xs underline text-[var(--ink)]/50 hover:text-[var(--ink)]">
          {editingBudget ? "Cancel" : "Set budget"}
        </button>
      </div>

      {editingBudget && (
        <div className="flex gap-2 mb-3">
          <input type="number" placeholder="New monthly budget" value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm w-32" />
          <button onClick={saveBudget} className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>Save</button>
        </div>
      )}

      <div className="h-2 w-full rounded-full overflow-hidden mb-2" style={{ background: "rgba(36,41,59,0.1)" }}>
        <motion.div className="h-full rounded-full" style={{ background: pct > 85 ? "var(--accent)" : "var(--sage)" }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>

      <div className="flex gap-4 text-xs text-[var(--ink)]/60 mb-3">
        <span>Today: ₹{todaySpent}</span>
        <span>This month: ₹{monthSpent}</span>
      </div>

      <form onSubmit={handleSaveExpense} className="flex gap-2 mb-2">
        <input type="number" placeholder="Amount" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm w-24" />
        <select value={["Food", "Transport", "Snacks", "Shopping", "Other"].includes(form.category) ? form.category : "__custom__"}
          onChange={(e) => {
            if (e.target.value === "__custom__") setForm({ ...form, category: "" });
            else setForm({ ...form, category: e.target.value });
          }}
          className="border rounded-lg px-2 py-1 text-sm">
          {["Food", "Transport", "Snacks", "Shopping", "Other"].map((c) => <option key={c}>{c}</option>)}
          <option value="__custom__">+ Custom...</option>
        </select>
        {(!["Food", "Transport", "Snacks", "Shopping", "Other"].includes(form.category)) && (
          <input
            placeholder="Custom category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border rounded-lg px-2 py-1 text-sm w-28"
          />
        )}
        <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>
          {editingExpenseId ? "Update" : "Add"}
        </button>
        {editingExpenseId && (
          <button type="button" onClick={() => { setEditingExpenseId(null); setForm({ amount: "", category: "Food" }); }} className="text-sm opacity-50">
            Cancel
          </button>
        )}
      </form>

      <button onClick={() => setShowList(!showList)} className="text-xs underline text-[var(--ink)]/50 hover:text-[var(--ink)]">
        {showList ? "Hide" : "Show"} recent expenses ({expenses.length})
      </button>

      <AnimatePresence>
        {showList && (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 overflow-hidden">
            {recentExpenses.map((exp) => (
              <li key={exp.id} className="flex items-center gap-2 text-xs mb-1">
                <span>₹{exp.amount} — {exp.category} ({new Date(exp.date).toLocaleDateString()})</span>
                <button onClick={() => startEditExpense(exp)} className="text-[var(--ink)]/40 hover:text-[var(--accent)] ml-auto">Edit</button>
                <button onClick={() => handleDeleteExpense(exp.id)} className="text-[var(--ink)]/40 hover:text-[var(--accent)]">✕</button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}