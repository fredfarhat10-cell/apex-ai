import { type NextRequest, NextResponse } from "next/server"
import { fetchMarketData, fetchCryptoData } from "@/lib/market-data-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get("ticker")
    const type = searchParams.get("type") || "stock"

    if (!ticker) {
      return NextResponse.json({ error: "Ticker parameter is required" }, { status: 400 })
    }

    let marketData
    if (type === "crypto") {
      marketData = await fetchCryptoData(ticker)
    } else {
      marketData = await fetchMarketData(ticker)
    }

    if (!marketData) {
      return NextResponse.json({ error: "Failed to fetch market data" }, { status: 404 })
    }

    return NextResponse.json(marketData)
  } catch (error) {
    console.error("[v0] Market data API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tickers, type = "stock" } = body

    if (!tickers || !Array.isArray(tickers)) {
      return NextResponse.json({ error: "Tickers array is required" }, { status: 400 })
    }

    const results: Record<string, any> = {}

    for (const ticker of tickers) {
      let data
      if (type === "crypto") {
        data = await fetchCryptoData(ticker)
      } else {
        data = await fetchMarketData(ticker)
      }

      if (data) {
        results[ticker] = data
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Market data batch API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
