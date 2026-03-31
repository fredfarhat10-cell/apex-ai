import { type NextRequest, NextResponse } from "next/server"
import { PreCognitionEngine } from "@/lib/precognition-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, userContext } = await request.json()

    console.log("[v0] Detecting unspoken desires...")

    const pce = new PreCognitionEngine(userId)

    const desires = await pce.detectUnspokenDesires(userContext)
    const events = await pce.monitorPreCognitionEvents(userContext)

    console.log("[v0] Detected", desires.length, "unspoken desires")
    console.log("[v0] Detected", events.length, "pre-cognition events")

    return NextResponse.json({
      success: true,
      desires,
      events,
    })
  } catch (error) {
    console.error("[v0] Pre-cognition detection error:", error)
    return NextResponse.json({ success: false, error: "Failed to detect pre-cognition signals" }, { status: 500 })
  }
}
