export async function getAISummary({ classes, assignments, weather, budget, medicines }) {
  const prompt = `
You are a helpful assistant for a student. Based on this data, respond with ONLY valid JSON (no markdown, no code fences, no extra text) in exactly this shape:

{
  "greeting": "one short warm opening line, e.g. 'Good morning! Here's your day.'",
  "weather": "one short sentence about the weather and any advice (umbrella, etc)",
  "routine": "one short sentence about today's classes/schedule",
  "assignments": "one short sentence about assignments due, or 'Nothing due right now.'",
  "note": "one short sentence combining budget + medicine reminders, or 'All clear on budget and medicines.'",
  "priority": "one short sentence naming the single most important thing to do today"
}

Data:
Classes today: ${JSON.stringify(classes)}
Assignments due soon: ${JSON.stringify(assignments)}
Weather: ${JSON.stringify(weather)}
Budget remaining: ${budget}
Medicines today: ${JSON.stringify(medicines)}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  const rawText = data.candidates[0].content.parts[0].text;

  // Gemini sometimes wraps JSON in ```json fences — strip those if present
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // fallback: if parsing fails, show the raw text in one section
    return { greeting: rawText, weather: "", routine: "", assignments: "", note: "", priority: "" };
  }
}