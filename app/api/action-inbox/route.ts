import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (isDemoMode) {
      // Return mock data in demo mode
      const { mockActionItems } = await import("@/lib/mock-action-items")
      return NextResponse.json({
        success: true,
        items: mockActionItems,
        source: "demo",
      })
    }

    // The frontend will send tokens in the request body
    const body = await request.json().catch(() => ({}))
    const { tokens } = body

    if (!tokens || !tokens.accessToken) {
      // No tokens available, return empty array
      return NextResponse.json({
        success: true,
        items: [],
        source: "no-auth",
        message: "Please connect your Google account to see action items",
      })
    }

    // Call CrewAI backend with tokens
    const crewaiUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${crewaiUrl}/api/tasks/get_action_items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: request.headers.get("x-user-id") || "default-user",
        google_tokens: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          token_type: tokens.tokenType || "Bearer",
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`CrewAI backend error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      items: data.items || [],
      source: "live",
    })
  } catch (error) {
    console.error("[v0] Error fetching action items:", error)

    // Fallback to mock data on error
    const { mockActionItems } = await import("@/lib/mock-action-items")
    return NextResponse.json({
      success: true,
      items: mockActionItems,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
