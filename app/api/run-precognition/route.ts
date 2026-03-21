import { NextResponse } from "next/server"
import { PreCognitionEngine } from "@/lib/precognition-engine"
import type { AppState } from "@/lib/types"

export const runtime = "edge"

/**
 * Pre-Cognition API Route
 * Runs every morning at 6:30 AM to detect unspoken desires and propose autonomous actions
 */
export async function POST(request: Request) {
  try {
    const { userId, userContext } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log("[v0] Running pre-cognition analysis for user:", userId)

    // Initialize Pre-Cognition Engine
    const engine = new PreCognitionEngine(userId)

    // Detect unspoken desires from user behavior patterns
    const desires = await engine.detectUnspokenDesires(userContext as Partial<AppState>)

    console.log("[v0] Detected unspoken desires:", desires.length)

    // Monitor for pre-cognition events (opportunity windows, pattern breaks, risk spikes)
    const events = await engine.monitorPreCognitionEvents(userContext as Partial<AppState>)

    console.log("[v0] Detected pre-cognition events:", events.length)

    // Create autonomous actions for high-confidence desires
    const autonomousActions = []
    for (const desire of desires) {
      if (desire.confidence > 0.7 && desire.autonomousActionPlan) {
        const action = await engine.createAutonomousAction(desire)
        autonomousActions.push(action)
      }
    }

    console.log("[v0] Created autonomous actions:", autonomousActions.length)

    // Prepare morning briefing for TalkingOrb
    const briefing = {
      timestamp: new Date().toISOString(),
      desires,
      events,
      autonomousActions,
      summary: generateBriefingSummary(desires, events, autonomousActions),
    }

    return NextResponse.json({
      success: true,
      briefing,
      message: "Pre-cognition analysis complete",
    })
  } catch (error) {
    console.error("[v0] Pre-cognition error:", error)
    return NextResponse.json(
      {
        error: "Failed to run pre-cognition analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * Generate human-readable briefing summary for TalkingOrb
 */
function generateBriefingSummary(desires: any[], events: any[], actions: any[]): string {
  const parts: string[] = []

  if (desires.length > 0) {
    const topDesire = desires[0]
    parts.push(`I detected ${desires.length} unspoken desire${desires.length > 1 ? "s" : ""}.`)
    parts.push(`Top insight: ${topDesire.inferredIntent}`)
  }

  if (events.length > 0) {
    const criticalEvents = events.filter((e) => e.priority === "critical")
    if (criticalEvents.length > 0) {
      parts.push(`⚠️ ${criticalEvents.length} critical event${criticalEvents.length > 1 ? "s" : ""} require attention.`)
    }
  }

  if (actions.length > 0) {
    parts.push(`I've prepared ${actions.length} autonomous action${actions.length > 1 ? "s" : ""} for your approval.`)
  }

  if (parts.length === 0) {
    return "All systems nominal. No urgent actions detected."
  }

  return parts.join(" ")
}
