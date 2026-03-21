import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { action, context, userProfile } = await request.json()

    const { text } = await generateText({
      model: "google/gemini-2.5-flash",
      prompt: `
You are the Symbiont Feed AI, generating brief, contextual event notifications for a cognitive co-pilot app.

User: ${userProfile?.name || "User"}
Action: ${action}
Context: ${JSON.stringify(context)}

Generate a single, brief (max 15 words) event notification that:
1. Acknowledges the action
2. Adds contextual insight or encouragement
3. Feels like an intelligent assistant observing and supporting

Examples:
- "Logged $45 coffee expense. Consider brewing at home to save $900/year."
- "Completed morning run habit. Consistency builds momentum."
- "Added new knowledge item. Your second brain is growing."

Return ONLY the event text, nothing else.
      `,
      maxOutputTokens: 100,
      temperature: 0.8,
    })

    return NextResponse.json({ event: text.trim() })
  } catch (error) {
    console.error("[v0] Error generating symbiont event:", error)
    return NextResponse.json({ error: "Failed to generate event" }, { status: 500 })
  }
}
