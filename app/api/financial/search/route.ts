import { type NextRequest, NextResponse } from "next/server"
import { searchStocks } from "@/lib/market-data-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const results = await searchStocks(query)

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Stock search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
