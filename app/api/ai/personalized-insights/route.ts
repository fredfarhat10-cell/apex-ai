import { NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  try {
    const { userProfile, hobbies, aura, sharingLevel } = await request.json()

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const prompt = `You are an AI assistant generating personalized insights for a user.

User Profile: ${JSON.stringify(userProfile)}
Hobbies: ${hobbies?.join(", ") || "None shared yet"}
Current Aura: ${aura}
Sharing Level: ${sharingLevel}/5 (how much they've shared)

Based on this minimal data, generate:
1. A personalized tip related to their hobbies (if any)
2. An encouragement to share more to unlock custom plans
3. A preview of what they could unlock next

Keep it concise, encouraging, and tailored to their Aura state.
${aura === "Tired" ? "Keep suggestions short and easy." : ""}
${aura === "Focused" ? "Provide detailed, actionable advice." : ""}
${aura === "Creative" ? "Inspire with creative ideas." : ""}
${aura === "Stressed" ? "Offer calming, supportive suggestions." : ""}
${aura === "Energized" ? "Suggest ambitious, high-energy activities." : ""}

Format as JSON: { "tip": "...", "encouragement": "...", "nextUnlock": "..." }`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
    const insights = jsonMatch
      ? JSON.parse(jsonMatch[1] || jsonMatch[0])
      : {
          tip: "Keep exploring your interests!",
          encouragement: "Share more hobbies to unlock personalized plans.",
          nextUnlock: "Custom practice schedules",
        }

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error generating personalized insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
