import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.BINANCE_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/binance/callback`

    if (!clientId) {
      return NextResponse.json({ error: "Binance OAuth not configured" }, { status: 500 })
    }

    // Binance OAuth authorization URL
    const authUrl = new URL("https://accounts.binance.com/oauth/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "user:email,user:address,wallet:accounts:read,wallet:transactions:read")

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error("[v0] Error generating Binance auth URL:", error)
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 })
  }
}
