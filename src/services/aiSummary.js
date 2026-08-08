export async function getAISummary({ classes, assignments, weather, budgetInfo, medicines }) {
  const prompt = `
You are a helpful assistant for a student. Based on this data, respond with ONLY valid JSON (no markdown, no code fences, no extra text) in exactly this shape:

{
  "greeting": "one short warm opening line",
  "weather": "one short sentence about the weather and any advice (umbrella, etc)",
  "routine": "one short sentence about today's classes/schedule",
  "assignments": "one short sentence about assignments due, or 'Nothing due right now.'",
  "budget": "one short sentence stating how much was spent today and this month, and whether that's on track or a concern",
  "medicine": "one short sentence about medicines due today, or 'No medicines scheduled today.'",
  "priority": "one short sentence naming the single most important thing to do today"
}

Data:
Classes today: ${JSON.stringify(classes)}
Assignments due soon: ${JSON.stringify(assignments)}
Weather: ${JSON.stringify(weather)}
Budget: monthly limit ₹${budgetInfo.monthlyBudget}, spent today ₹${budgetInfo.todaySpent}, spent this month ₹${budgetInfo.monthSpent}, remaining ₹${budgetInfo.remaining}
Medicines today: ${JSON.stringify(medicines)}
`;

  // Abort if Gemini takes longer than 12 seconds, so the UI never hangs forever
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Gemini returned no text");

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    clearTimeout(timeout);
    console.error("AI summary failed:", err.message);
    // Return null so the UI can show a clear retry state instead of hanging
    return null;
  }
}