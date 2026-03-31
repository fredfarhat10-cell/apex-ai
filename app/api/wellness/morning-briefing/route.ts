import { type NextRequest, NextResponse } from "next/server"
import { WellnessOracle } from "@/lib/wellness-oracle"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const oracle = new WellnessOracle()
    await oracle.init()

    const briefing = await oracle.generateMorningBriefing(userId)

    return NextResponse.json({ briefing })
  } catch (error) {
    console.error("Morning briefing error:", error)
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 })
  }
}
