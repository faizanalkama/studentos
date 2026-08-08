import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

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

export default function NavBar() {
  const location = useLocation();

  return (
    <>
      <nav
        className="hidden md:flex items-center gap-1 px-4 py-2 sticky top-0 z-20 backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--paper) 85%, transparent)", borderBottom: "1px solid var(--border-color)" }}
      >
        <span className="font-display text-lg font-semibold mr-4" style={{ color: "var(--accent)" }}>
          StudentOS
        </span>
        {LINKS.map((l) => {
          const isActive = l.end ? location.pathname === l.to : location.pathname.startsWith(l.to);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="relative text-sm px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{ color: isActive ? "white" : "inherit", opacity: isActive ? 1 : 0.7 }}
            >
              {isActive && (
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

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center py-1.5"
        style={{ background: "var(--card-bg)", borderTop: "1px solid var(--border-color)" }}
      >
        {LINKS.slice(0, 5).map((l) => {
          const isActive = l.end ? location.pathname === l.to : location.pathname.startsWith(l.to);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="relative flex flex-col items-center text-[10px] px-2 py-1 rounded-lg"
              style={{ color: isActive ? "var(--accent)" : "inherit", opacity: isActive ? 1 : 0.6 }}
            >
              {isActive && (
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
      </nav>
    </>
  );
}