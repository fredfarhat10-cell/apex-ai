import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.COINBASE_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/coinbase/callback`

    if (!clientId) {
      return NextResponse.json({ error: "Coinbase OAuth not configured" }, { status: 500 })
    }

    // Coinbase OAuth authorization URL
    const authUrl = new URL("https://www.coinbase.com/oauth/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "wallet:accounts:read,wallet:transactions:read,wallet:user:read")

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error("[v0] Error generating Coinbase auth URL:", error)
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 })
  }
}
