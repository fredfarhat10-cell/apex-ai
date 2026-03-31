import { type NextRequest, NextResponse } from "next/server"
import { getCashFlowInsights } from "@/lib/ai-cash-flow-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "demo-user"

    const insights = await getCashFlowInsights(userId)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[v0] Error fetching cash flow insights:", error)
    return NextResponse.json({ error: "Failed to fetch cash flow insights" }, { status: 500 })
  }
}
