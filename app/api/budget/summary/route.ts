import { type NextRequest, NextResponse } from "next/server"
import { getBudgetSummary } from "@/lib/ai-cash-flow-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "demo-user"
    const month = searchParams.get("month") || undefined

    const summary = await getBudgetSummary(userId, month)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Error fetching budget summary:", error)
    return NextResponse.json({ error: "Failed to fetch budget summary" }, { status: 500 })
  }
}
