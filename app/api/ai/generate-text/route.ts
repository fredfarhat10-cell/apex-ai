import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const { text } = await generateText({
      model: "google/gemini-2.5-flash",
      prompt,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("[v0] Error generating text:", error)
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 })
  }
}
