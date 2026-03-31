import { type NextRequest, NextResponse } from "next/server"
import { RegretMinimizationEngine } from "@/lib/regret-minimization-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, userContext } = await request.json()

    console.log("[v0] Detecting pre-cognition triggers...")

    const rme = new RegretMinimizationEngine(userId)

    // Detect triggers
    const triggers = await rme.detectPreCognitionTriggers(userContext)

    console.log("[v0] Detected", triggers.length, "pre-cognition triggers")

    return NextResponse.json({
      success: true,
      triggers,
    })
  } catch (error) {
    console.error("[v0] Pre-cognition detection error:", error)
    return NextResponse.json({ success: false, error: "Failed to detect pre-cognition triggers" }, { status: 500 })
  }
}
