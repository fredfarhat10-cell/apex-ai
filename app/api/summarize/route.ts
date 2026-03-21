import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content provided" }, { status: 400 })
    }

    // Use the AI SDK to generate a summary
    const { text: summary } = await generateText({
      model: "google/gemini-2.5-flash",
      prompt: `Summarize the following text for a busy executive. Be concise, highlight key points, and focus on actionable insights:\n\n${content}`,
      maxOutputTokens: 500,
      temperature: 0.3, // Lower temperature for more focused summaries
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
