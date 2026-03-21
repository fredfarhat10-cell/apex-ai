import { type NextRequest, NextResponse } from "next/server"
import { getCryptoPortfolio } from "@/lib/crypto-aggregation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
    }

    const portfolio = await getCryptoPortfolio(userId)

    return NextResponse.json({
      success: true,
      portfolio,
    })
  } catch (error) {
    console.error("[v0] Crypto portfolio error:", error)
    return NextResponse.json({ success: false, error: "Failed to get crypto portfolio" }, { status: 500 })
  }
}
