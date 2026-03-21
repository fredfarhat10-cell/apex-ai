export async function POST(request: Request) {
  try {
    const { decision, aura, userContext } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const prompt = `You are a life simulation AI. Analyze this decision and generate 3 possible future paths.

Decision: ${decision}
User Aura Score: ${aura}/100
Context: ${JSON.stringify(userContext)}

Generate a JSON response with this structure:
{
  "paths": [
    {
      "title": "Path name",
      "probability": 40,
      "description": "What happens in this timeline",
      "impacts": [
        {"dimension": "Wellness", "direction": "positive", "change": "+15% energy"},
        {"dimension": "Productivity", "direction": "negative", "change": "-10% focus"}
      ]
    }
  ]
}

Dimensions: Wellness, Productivity, Finances, Habits, Relationships
Directions: positive, negative, neutral`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9 },
        }),
      },
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const simulation = jsonMatch ? JSON.parse(jsonMatch[0]) : { paths: [] }

    return Response.json({ decision, ...simulation })
  } catch (error) {
    console.error("[v0] Simulation error:", error)
    return Response.json({ error: "Failed to simulate decision" }, { status: 500 })
  }
}
