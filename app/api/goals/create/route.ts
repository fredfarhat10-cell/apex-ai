import { type NextRequest, NextResponse } from "next/server"
import { createFinancialGoal } from "@/lib/goal-accelerator"

export async function POST(request: NextRequest) {
  try {
    const { userId, ...goalData } = await request.json()

    const goal = await createFinancialGoal(userId, goalData)

    return NextResponse.json(goal)
  } catch (error) {
    console.error("[v0] Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
