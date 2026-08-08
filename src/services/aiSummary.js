export async function getAISummary({ classes, assignments, weather, budget, medicines }) {
  const prompt = `
You are a helpful assistant for a student. Based on this data, write a short, warm daily summary (4-5 sentences) ending with one recommended priority for today.

Classes today: ${JSON.stringify(classes)}
Assignments due soon: ${JSON.stringify(assignments)}
Weather: ${JSON.stringify(weather)}
Budget remaining: ${budget}
Medicines today: ${JSON.stringify(medicines)}
`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AQ.Ab8RN6LSS9Ag4Ygp1SCAdFg3ODgBnE2prz_cZmqf1l76U53yVA",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}