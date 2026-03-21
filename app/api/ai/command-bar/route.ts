import { generateObject } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

const commandSchema = z.object({
  type: z.enum(["expense", "reminder", "general"]),
  data: z
    .object({
      description: z.string().optional(),
      amount: z.number().optional(),
      category: z.string().optional(),
      text: z.string().optional(),
      dueDate: z.string().optional(),
    })
    .optional(),
  message: z.string(),
})

export async function POST(request: Request) {
  try {
    const { input } = await request.json()

    const { object } = await generateObject({
      model: "google/gemini-2.5-flash",
      schema: commandSchema,
      prompt: `
You are a command bar assistant. Parse the user's input and determine if they want to:
1. Log an expense (e.g., "log expense $20 for coffee")
2. Add a reminder (e.g., "remind me to call John tomorrow")
3. General query

User input: "${input}"

If it's an expense, extract: description, amount, category
If it's a reminder, extract: text, dueDate (in ISO format)
Otherwise, provide a helpful response.

Return a JSON object with: { type: "expense" | "reminder" | "general", data: {...}, message: "..." }
      `,
      maxOutputTokens: 1000,
    })

    return NextResponse.json({ result: object })
  } catch (error) {
    console.error("[v0] Error processing command:", error)
    return NextResponse.json({ error: "Failed to process command" }, { status: 500 })
  }
}
