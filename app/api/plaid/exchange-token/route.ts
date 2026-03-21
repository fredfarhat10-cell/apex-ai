import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { publicToken } = await request.json()

    // In production, this would call the actual Plaid API
    // For demo, return a mock access token
    const mockResponse = {
      access_token: `access-sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item_id: `item_${Date.now()}`,
      request_id: `req_${Date.now()}`,
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("[v0] Error exchanging token:", error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}
