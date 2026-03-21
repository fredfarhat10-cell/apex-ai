import { generateObject } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"
import { buildAIContext, formatContextForPrompt } from "@/services/ai-context-builder"

const insightsSchema = z.object({
  insights: z.array(
    z.object({
      type: z.enum(["suggestion", "warning", "celebration", "tip"]),
      title: z.string(),
      message: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
})

export async function POST(request: Request) {
  try {
    const { userProfile, strategicGoal, expenses, habits, habitLogs, knowledgeItems, aura } = await request.json()

    const state = { userProfile, strategicGoal, expenses, habits, habitLogs, knowledgeItems, aura }
    const context = buildAIContext(state)
    const contextPrompt = formatContextForPrompt(context)

    const todayStr = new Date().toISOString().split("T")[0]
    const safeHabitLogs = habitLogs || []
    const safeExpenses = expenses || []
    const safeHabits = habits || []
    const safeKnowledgeItems = knowledgeItems || []

    const completedToday = safeHabitLogs.filter((log: any) => log.date === todayStr && log.completed).length
    const totalExpenses = safeExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)

    const { object } = await generateObject({
      model: "google/gemini-2.5-flash",
      schema: insightsSchema,
      prompt: `
${contextPrompt}

=== TASK ===
You are Apex Synapse, a proactive AI cognitive co-pilot. Generate 3-5 actionable insights based on the user's complete context above.

Current metrics:
- Total Expenses: $${totalExpenses.toFixed(2)}
- Expenses Count: ${safeExpenses.length}
- Habits Tracked: ${safeHabits.length}
- Habits Completed Today: ${completedToday}
- Knowledge Items: ${safeKnowledgeItems.length}

Generate insights that are:
1. **Contextual** - Reference specific data points from their activity
2. **Actionable** - Provide concrete next steps
3. **Proactive** - Anticipate needs before they ask
4. **Personalized** - Match their aura (${aura}) and strategic goal

Insight types:
- "suggestion": Proactive recommendations for improvement
- "warning": Gentle alerts about potential issues (spending patterns, missed habits)
- "celebration": Acknowledge achievements and progress
- "tip": Quick wins and productivity hacks

Priority levels:
- "high": Urgent or highly impactful (e.g., budget overrun, streak at risk)
- "medium": Important but not urgent
- "low": Nice to have, optional

Return 3-5 insights ordered by priority (high first).
      `,
      maxOutputTokens: 2000,
      temperature: 0.8,
    })

    return NextResponse.json({ insights: object.insights })
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
