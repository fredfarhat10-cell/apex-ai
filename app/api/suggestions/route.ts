import { NextResponse } from "next/server"
import { generateSuggestions } from "@/lib/suggestion-engine"

export async function POST(request: Request) {
  try {
    const { userContext } = await request.json()

    const suggestions = await generateSuggestions(userContext)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Suggestion generation error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
