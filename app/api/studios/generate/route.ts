import { type NextRequest, NextResponse } from "next/server"
import { StudioGenesisEngine } from "@/lib/studio-genesis-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, interests, conversationText } = await request.json()

    if (!userId || !interests || !conversationText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const engine = new StudioGenesisEngine()
    await engine.init()

    const studios = await engine.generateStudios(userId, interests, conversationText)

    return NextResponse.json({ studios })
  } catch (error) {
    console.error("Studio generation error:", error)
    return NextResponse.json({ error: "Failed to generate studios" }, { status: 500 })
  }
}
