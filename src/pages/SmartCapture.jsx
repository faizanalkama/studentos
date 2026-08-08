// STAGE PLACEHOLDER — Smart Capture is intentionally not built yet.
// Per your own hackathon priority list, this is #6 (after Home, Budget,
// Study, Medicine) and the highest-risk feature to get working reliably.
// This stub exists so the nav link doesn't 404, and so the AI-extraction
// flow can be dropped in later without touching anything else.
export default function SmartCapture() {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-2xl mx-auto pb-20">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-4">✨ Smart Capture</h1>
      <div className="rounded-2xl p-6 text-center" style={{ background: "var(--card-bg)", border: "1px dashed var(--border-color)" }}>
        <p className="text-sm opacity-60 mb-2">Coming soon.</p>
        <p className="text-xs opacity-40">
          Upload a photo of an assignment notice, timetable, event poster, receipt, or medicine —
          AI will extract the details for you to confirm before anything is saved.
        </p>
      </div>
    </div>
  );
}
