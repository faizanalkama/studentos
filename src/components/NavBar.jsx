import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const LINKS = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/study", label: "Study", icon: "📚" },
  { to: "/budget", label: "Budget", icon: "💰" },
  { to: "/health", label: "Health", icon: "💊" },
  { to: "/calendar", label: "Calendar", icon: "📅" },
  { to: "/capture", label: "Smart Capture", icon: "✨" },
  { to: "/notifications", label: "Notifications", icon: "🔔" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

const MOBILE_PRIMARY = LINKS.slice(0, 4); // Home, Study, Budget, Health
const MOBILE_OVERFLOW = LINKS.slice(4); // Calendar, Smart Capture, Notifications, Settings

export default function NavBar() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to));
  const overflowActive = MOBILE_OVERFLOW.some(isActive);

  return (
    <>
      {/* Desktop / tablet: top bar, unchanged */}
      <nav
        className="hidden md:flex items-center gap-1 px-4 py-2 sticky top-0 z-20 backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--paper) 85%, transparent)", borderBottom: "1px solid var(--border-color)" }}
      >
        <span className="font-display text-lg font-semibold mr-4" style={{ color: "var(--accent)" }}>
          StudentOS
        </span>
        {LINKS.map((l) => {
          const active = isActive(l);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="relative text-sm px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{ color: active ? "white" : "inherit", opacity: active ? 1 : 0.7 }}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full -z-10"
                  style={{ background: "var(--accent)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {l.icon} {l.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile: bottom tab bar with "More" for overflow */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center py-1.5"
        style={{ background: "var(--card-bg)", borderTop: "1px solid var(--border-color)" }}
      >
        {MOBILE_PRIMARY.map((l) => {
          const active = isActive(l);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMoreOpen(false)}
              className="relative flex flex-col items-center text-[10px] px-2 py-1 rounded-lg"
              style={{ color: active ? "var(--accent)" : "inherit", opacity: active ? 1 : 0.6 }}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill-mobile"
                  className="absolute -top-1.5 w-1 h-1 rounded-full"
                  style={{ background: "var(--accent)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="text-base leading-none">{l.icon}</span>
              {l.label}
            </NavLink>
          );
        })}

        <button
          onClick={() => setMoreOpen((v) => !v)}
          className="relative flex flex-col items-center text-[10px] px-2 py-1 rounded-lg"
          style={{ color: overflowActive || moreOpen ? "var(--accent)" : "inherit", opacity: overflowActive || moreOpen ? 1 : 0.6 }}
        >
          <span className="text-base leading-none">☰</span>
          More
        </button>
      </nav>

      {/* Overflow menu sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 z-20"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed bottom-16 left-0 right-0 z-20 mx-3 rounded-2xl p-2"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lift)" }}
            >
              {MOBILE_OVERFLOW.map((l) => {
                const active = isActive(l);
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl"
                    style={{ color: active ? "var(--accent)" : "inherit", background: active ? "var(--accent-glow)" : "transparent" }}
                  >
                    <span className="text-base">{l.icon}</span>
                    {l.label}
                  </NavLink>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}