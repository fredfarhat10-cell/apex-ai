import { type NextRequest, NextResponse } from "next/server"
import { requestAlphaBrief } from "@/lib/alpha-brief-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, ticker } = await request.json()

    if (!ticker || ticker.trim().length === 0) {
      return NextResponse.json({ error: "Ticker is required" }, { status: 400 })
    }

    const researchRequest = await requestAlphaBrief(userId, ticker)

    return NextResponse.json(researchRequest)
  } catch (error) {
    console.error("[v0] Error requesting alpha brief:", error)
    return NextResponse.json({ error: "Failed to request alpha brief" }, { status: 500 })
  }
}
