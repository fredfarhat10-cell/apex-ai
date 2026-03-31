import { generateObject } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

const financialSimulationSchema = z.object({
  strategies: z.array(
    z.object({
      strategy: z.string(),
      outcome: z.string(),
      probability: z.number().min(0).max(100),
    }),
  ),
})

export async function POST(request: Request) {
  try {
    const { expenses, profile } = await request.json()

    const { object } = await generateObject({
      model: "google/gemini-2.5-flash",
      schema: financialSimulationSchema,
      prompt: `
Act as a financial projection model. Based on the user's expenses and profile, simulate various financial strategies.
Evaluate each strategy based on potential outcomes and provide a detailed analysis.

User Profile:
- Occupation: ${profile.occupation}
- Financial Risk Style: ${profile.financialRiskStyle}

Expenses:
${JSON.stringify(expenses, null, 2)}

Generate 3-5 financial strategies with their potential outcomes and probability of success (0-100).
      `,
      maxOutputTokens: 2000,
    })

    return NextResponse.json({ strategies: object.strategies })
  } catch (error) {
    console.error("[v0] Error simulating financial strategies:", error)
    return NextResponse.json({ error: "Failed to simulate financial strategies" }, { status: 500 })
  }
}
