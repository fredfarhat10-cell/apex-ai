import { type NextRequest, NextResponse } from "next/server"
import { fetchStockDetails, calculateESGScore } from "@/lib/market-data-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get("ticker")

    if (!ticker) {
      return NextResponse.json({ error: "Ticker parameter is required" }, { status: 400 })
    }

    const details = await fetchStockDetails(ticker)

    if (!details) {
      return NextResponse.json({ error: "Failed to fetch stock details" }, { status: 404 })
    }

    // Calculate ESG score
    const esgScore = await calculateESGScore(ticker, details.sector)

    return NextResponse.json({
      ...details,
      esg: esgScore,
    })
  } catch (error) {
    console.error("[v0] Stock details API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
