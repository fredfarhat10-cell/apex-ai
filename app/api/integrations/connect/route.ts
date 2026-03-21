import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider, userId } = await request.json()

    if (!provider || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log(`[v0] Simulating OAuth connection for ${provider}`)

    // Simulate successful connection
    const mockIntegration = {
      id: `int_${Date.now()}`,
      provider,
      userId,
      status: "connected",
      connectedAt: new Date().toISOString(),
      accessToken: `mock_token_${provider}_${Date.now()}`,
    }

    return NextResponse.json({
      success: true,
      integration: mockIntegration,
      message: `Successfully connected to ${provider}`,
    })
  } catch (error) {
    console.error("[v0] Integration connection error:", error)
    return NextResponse.json({ success: false, error: "Failed to connect integration" }, { status: 500 })
  }
}
