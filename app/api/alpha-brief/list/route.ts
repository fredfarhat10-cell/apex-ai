import { NextResponse } from "next/server"
import { getUserBriefs } from "@/lib/alpha-brief-engine"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "demo-user"

    const briefs = await getUserBriefs(userId)

    return NextResponse.json({
      success: true,
      briefs,
    })
  } catch (error) {
    console.error("[v0] Error fetching alpha briefs:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch briefs",
      },
      { status: 500 },
    )
  }
}
