import { type NextRequest, NextResponse } from "next/server"
import { projectGoalCompletion } from "@/lib/goal-accelerator"

export async function POST(request: NextRequest) {
  try {
    const { goal } = await request.json()

    const projection = await projectGoalCompletion(goal)

    return NextResponse.json(projection)
  } catch (error) {
    console.error("[v0] Error projecting goal:", error)
    return NextResponse.json({ error: "Failed to project goal" }, { status: 500 })
  }
}
