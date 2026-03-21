import { type NextRequest, NextResponse } from "next/server"
import { getRequestStatus, getAlphaBrief } from "@/lib/alpha-brief-engine"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    const requestStatus = await getRequestStatus(requestId)

    if (!requestStatus) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // If completed, include the brief
    if (requestStatus.status === "completed" && requestStatus.briefId) {
      const brief = await getAlphaBrief(requestStatus.briefId)
      return NextResponse.json({ request: requestStatus, brief })
    }

    return NextResponse.json({ request: requestStatus })
  } catch (error) {
    console.error("[v0] Error getting request status:", error)
    return NextResponse.json({ error: "Failed to get request status" }, { status: 500 })
  }
}
