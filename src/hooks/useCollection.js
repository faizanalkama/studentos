import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db, auth } from "../firebase";

const cache = {};

export function useCollection(name) {
  const [data, setData] = useState(() => cache[name]?.data ?? []);

  useEffect(() => {
    if (!cache[name]) {
      const uid = auth.currentUser.uid;
      const colRef = collection(db, "users", uid, name);
      cache[name] = { data: [], subscribers: new Set(), unsub: null };
      cache[name].unsub = onSnapshot(query(colRef), (snap) => {
        cache[name].data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        cache[name].subscribers.forEach((fn) => fn(cache[name].data));
      });
    }
    const entry = cache[name];
    const listener = (d) => setData(d);
    entry.subscribers.add(listener);
    setData(entry.data);

    return () => {
      entry.subscribers.delete(listener);
      if (entry.subscribers.size === 0) {
        entry.unsub();
        delete cache[name];
      }
    };
  }, [name]);

  return data;
}