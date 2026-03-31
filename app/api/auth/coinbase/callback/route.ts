import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("[v0] Coinbase OAuth error:", error)
      return NextResponse.redirect(new URL(`/auth-demo?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/auth-demo?error=no_code", request.url))
    }

    const clientId = process.env.COINBASE_CLIENT_ID
    const clientSecret = process.env.COINBASE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/coinbase/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/auth-demo?error=config_missing", request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://api.coinbase.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
    const userResponse = await fetch("https://api.coinbase.com/v2/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user info")
    }

    const userData = await userResponse.json()

    // Redirect to success page with tokens
    const redirectUrl = new URL("/auth-demo", request.url)
    redirectUrl.searchParams.set("provider", "coinbase")
    redirectUrl.searchParams.set("success", "true")
    redirectUrl.searchParams.set("tokens", btoa(JSON.stringify(tokens)))
    redirectUrl.searchParams.set("user", btoa(JSON.stringify(userData.data)))

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Error in Coinbase OAuth callback:", error)
    return NextResponse.redirect(new URL("/auth-demo?error=callback_failed", request.url))
  }
}
