import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "../hooks/useCollection";

export default function Notes() {
  const notes = useCollection("notes");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", body: "" });

  const colRef = collection(db, "users", auth.currentUser.uid, "notes");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      await updateDoc(doc(db, "users", auth.currentUser.uid, "notes", editingId), { ...form, updatedAt: new Date().toISOString() });
      setEditingId(null);
    } else {
      await addDoc(colRef, { ...form, updatedAt: new Date().toISOString() });
    }
    setForm({ title: "", body: "" });
  };

  const startEdit = (n) => {
    setEditingId(n.id);
    setForm({ title: n.title, body: n.body || "" });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "notes", id));
    if (editingId === id) { setEditingId(null); setForm({ title: "", body: "" }); }
  };

  const sorted = [...notes].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  return (
    <div>
      <form onSubmit={handleSave} className="flex flex-col gap-2 mb-4">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm"
        />
        <textarea
          placeholder="Write a note…"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={3}
          className="border rounded-lg px-2 py-1 text-sm"
        />
        <div className="flex gap-2">
          <button type="submit" className="text-sm px-3 py-1 rounded-lg text-white" style={{ background: "var(--accent)" }}>
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", body: "" }); }} className="text-sm opacity-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {sorted.length === 0 && <p className="text-sm text-[var(--ink)]/50">No notes yet</p>}
        <AnimatePresence initial={false}>
          {sorted.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-sm rounded-lg px-3 py-2 card-elevated"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{n.title}</p>
                <div className="flex gap-2 flex-shrink-0 text-xs">
                  <button onClick={() => startEdit(n)} className="opacity-40 hover:text-[var(--accent)]">Edit</button>
                  <button onClick={() => handleDelete(n.id)} className="opacity-40 hover:text-[var(--accent)]">✕</button>
                </div>
              </div>
              {n.body && <p className="opacity-60 mt-1 whitespace-pre-wrap">{n.body}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}