import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.APPLE_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/apple/callback`

    if (!clientId) {
      return NextResponse.json({ error: "Apple OAuth not configured" }, { status: 500 })
    }

    // Apple Sign In authorization URL
    const authUrl = new URL("https://appleid.apple.com/auth/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("response_type", "code id_token")
    authUrl.searchParams.set("response_mode", "form_post")
    authUrl.searchParams.set("scope", "name email")

    return NextResponse.json({ authUrl: authUrl.toString() })
  } catch (error) {
    console.error("[v0] Error generating Apple auth URL:", error)
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 })
  }
}
