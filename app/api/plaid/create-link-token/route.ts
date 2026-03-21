import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // In production, this would call the actual Plaid API
    // For demo, return a mock link token
    const mockLinkToken = {
      link_token: `link-sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
      request_id: `req_${Date.now()}`,
    }

    return NextResponse.json(mockLinkToken)
  } catch (error) {
    console.error("[v0] Error creating link token:", error)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}
