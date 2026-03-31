import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { context } = await req.json()

    const prompt = `You are Apex's Symbiont Mode - a background AI that runs proactive simulations.

Context:
- User: ${context.profile?.name || "Unknown"}
- Recent expenses: ${context.recentExpenses?.length || 0} logged
- Active habits: ${context.activeHabits?.length || 0} completed

Generate ONE brief, actionable insight based on patterns you notice. Be proactive and helpful.
Keep it under 100 characters.`

    const { text } = await generateText({
      model: "google/gemini-2.5-flash-image",
      prompt,
      maxTokens: 100,
    })

    return NextResponse.json({ insight: text })
  } catch (error) {
    console.error("[v0] Symbiont simulation error:", error)
    return NextResponse.json({ error: "Failed to generate simulation" }, { status: 500 })
  }
}
