import { type NextRequest, NextResponse } from "next/server"
import { PreCognitionEngine } from "@/lib/precognition-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, desire } = await request.json()

    console.log("[v0] Creating autonomous action from desire...")

    const pce = new PreCognitionEngine(userId)

    const action = await pce.createAutonomousAction(desire)

    // If requires approval, return for user confirmation
    if (action.requiresApproval) {
      return NextResponse.json({
        success: true,
        action,
        requiresApproval: true,
        message: "Action requires user approval before execution",
      })
    }

    // Execute immediately if no approval needed
    const event = await pce.executeAutonomousAction(action)

    return NextResponse.json({
      success: true,
      action,
      event,
      message: "Autonomous action executed successfully",
    })
  } catch (error) {
    console.error("[v0] Autonomous action execution error:", error)
    return NextResponse.json({ success: false, error: "Failed to execute autonomous action" }, { status: 500 })
  }
}
