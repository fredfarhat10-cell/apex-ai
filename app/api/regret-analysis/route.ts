import { type NextRequest, NextResponse } from "next/server"
import { RegretMinimizationEngine } from "@/lib/regret-minimization-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, decision, context, userContext, alternatives } = await request.json()

    console.log("[v0] Analyzing regret potential for decision:", decision)

    const rme = new RegretMinimizationEngine(userId)

    // Calculate regret units
    const regretUnit = await rme.calculateRegretUnits(decision, context, userContext, alternatives)

    console.log("[v0] RU Score:", regretUnit.ruScore)
    console.log("[v0] RU Breakdown:", regretUnit.ruBreakdown)

    return NextResponse.json({
      success: true,
      regretUnit,
    })
  } catch (error) {
    console.error("[v0] Regret analysis error:", error)
    return NextResponse.json({ success: false, error: "Failed to analyze regret potential" }, { status: 500 })
  }
}
