import { type NextRequest, NextResponse } from "next/server"
import { createScenario } from "@/lib/goal-accelerator"

export async function POST(request: NextRequest) {
  try {
    const { goalId, name, description, adjustments } = await request.json()

    const scenario = await createScenario(goalId, name, description, adjustments)

    return NextResponse.json(scenario)
  } catch (error) {
    console.error("[v0] Error creating scenario:", error)
    return NextResponse.json({ error: "Failed to create scenario" }, { status: 500 })
  }
}
