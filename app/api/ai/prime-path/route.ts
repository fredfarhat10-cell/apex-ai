import { generateObject } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"
import { buildAIContext, formatContextForPrompt } from "@/services/ai-context-builder"

const primePathSchema = z.object({
  steps: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
})

export async function POST(request: Request) {
  try {
    const { profile, goal, aura, expenses, habits, habitLogs } = await request.json()

    const state = {
      userProfile: profile,
      strategicGoal: goal,
      aura,
      expenses: expenses || [],
      habits: habits || [],
      habitLogs: habitLogs || [],
      knowledgeItems: [],
      reminders: [],
      wardrobe: [],
      symbiontFeed: [],
      insights: {},
      appBackground: null,
      primePath: [],
    }
    const context = buildAIContext(state)
    const contextPrompt = formatContextForPrompt(context)

    const { object } = await generateObject({
      model: "google/gemini-2.5-flash",
      schema: primePathSchema,
      prompt: `
${contextPrompt}

=== TASK ===
Act as a strategic simulation engine. You have access to the user's complete context above.

Your task:
1. Simulate thousands of potential future timelines based on their current patterns
2. Identify the single path with the highest probability of success
3. Deconstruct this optimal path into exactly 4 high-level, actionable steps

Strategic Goal: "${goal}"

Consider:
- Their current spending patterns (${expenses?.length || 0} expenses tracked)
- Their habit consistency (${habits?.length || 0} habits, ${habitLogs?.length || 0} logs)
- Their emotional state (Aura: ${aura})
- Their skills and interests
- Their financial risk tolerance

Adjust complexity based on Aura:
- Tired: Suggest smaller, manageable initial steps
- Energized: Suggest bold, ambitious actions
- Stressed: Focus on stress reduction and quick wins
- Focused: Leverage their concentration for deep work
- Creative: Encourage experimentation and innovation

Return exactly 4 steps with:
- **title**: Clear, action-oriented (e.g., "Build Your Foundation", "Scale Your Impact")
- **description**: Specific, personalized guidance (2-3 sentences) that references their actual data

Make each step build on the previous one, creating a clear progression toward their goal.
      `,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return NextResponse.json({ steps: object.steps })
  } catch (error) {
    console.error("[v0] Error generating Prime Path:", error)
    return NextResponse.json({ error: "Failed to generate Prime Path" }, { status: 500 })
  }
}
