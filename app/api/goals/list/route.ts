import { NextResponse } from "next/server"
import { getUserGoals } from "@/lib/goal-accelerator"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "demo-user"

    const goals = await getUserGoals(userId)

    return NextResponse.json({
      success: true,
      goals,
    })
  } catch (error) {
    console.error("[v0] Error fetching goals:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch goals",
      },
      { status: 500 },
    )
  }
}
