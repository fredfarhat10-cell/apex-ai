import { type NextRequest, NextResponse } from "next/server"
import { PinterestAPI } from "@/lib/pinterest-api"

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const pinterest = new PinterestAPI()
    const pins = await pinterest.searchPins(query, limit)

    return NextResponse.json({ pins })
  } catch (error) {
    console.error("Pinterest search error:", error)
    return NextResponse.json({ error: "Pinterest search failed" }, { status: 500 })
  }
}
