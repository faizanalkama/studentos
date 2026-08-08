import { useState } from "react";

export default function Settings({ user, onLogout }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-md mx-auto pb-20">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-6">⚙ Settings</h1>

      <div className="flex items-center gap-3 mb-6">
        {user.photoURL && <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />}
        <div>
          <p className="font-medium">{user.displayName}</p>
          <p className="text-xs opacity-50">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <span className="text-sm">Theme</span>
        <button onClick={toggleTheme} className="text-sm px-3 py-1.5 rounded-full" style={{ border: "1px solid var(--border-color)" }}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <button onClick={onLogout} className="w-full text-sm text-center py-3 rounded-xl opacity-70 hover:opacity-100 underline underline-offset-4">
        Logout
      </button>
    </div>
  );
}
