import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("[v0] Binance OAuth error:", error)
      return NextResponse.redirect(new URL(`/auth-demo?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/auth-demo?error=no_code", request.url))
    }

    const clientId = process.env.BINANCE_CLIENT_ID
    const clientSecret = process.env.BINANCE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/binance/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/auth-demo?error=config_missing", request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://accounts.binance.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch("https://api.binance.com/api/v3/account", {
      headers: {
        "X-MBX-APIKEY": tokens.access_token,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user info")
    }

    const userInfo = await userResponse.json()

    // Redirect to success page with tokens
    const redirectUrl = new URL("/auth-demo", request.url)
    redirectUrl.searchParams.set("provider", "binance")
    redirectUrl.searchParams.set("success", "true")
    redirectUrl.searchParams.set("tokens", btoa(JSON.stringify(tokens)))

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Error in Binance OAuth callback:", error)
    return NextResponse.redirect(new URL("/auth-demo?error=callback_failed", request.url))
  }
}
