import Events from "../components/Events";

export default function Calendar() {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-3xl mx-auto pb-20">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-6">📅 Calendar</h1>
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <Events />
      </div>
    </div>
  );
}
