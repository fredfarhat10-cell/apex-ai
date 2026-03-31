import { NextResponse } from "next/server"

const apiKey = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  try {
    const { studioType, userProfile } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const prompt = `You are an AI assistant helping a user with their ${studioType} hobby. 
User profile: ${JSON.stringify(userProfile)}

Provide 3 personalized, actionable tips for their ${studioType} practice. Keep each tip concise (1-2 sentences).
Format as JSON: { "tips": ["tip1", "tip2", "tip3"] }`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    )

    if (!response.ok) {
      throw new Error("Gemini API request failed")
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return NextResponse.json({ tips: parsed.tips })
    }

    // Fallback tips
    return NextResponse.json({
      tips: [
        "Practice consistently, even if just for 10 minutes daily",
        "Set specific, measurable goals for your progress",
        "Connect with others who share your passion",
      ],
    })
  } catch (error) {
    console.error("[v0] Studio tips error:", error)
    return NextResponse.json(
      {
        tips: [
          "Practice consistently, even if just for 10 minutes daily",
          "Set specific, measurable goals for your progress",
          "Connect with others who share your passion",
        ],
      },
      { status: 200 },
    )
  }
}
