import { type NextRequest, NextResponse } from "next/server"
import { GoogleOAuthClient } from "@/lib/google-oauth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("[v0] OAuth error:", error)
      return NextResponse.redirect(new URL(`/career?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/career?error=no_code", request.url))
    }

    const oauthClient = new GoogleOAuthClient()
    const tokens = await oauthClient.exchangeCodeForTokens(code)
    const userInfo = await oauthClient.getUserInfo(tokens.access_token)

    // We'll pass the tokens to the frontend to store them client-side
    const tokensData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
      tokenType: tokens.token_type,
      scope: tokens.scope,
    }

    console.log("[v0] Successfully obtained tokens for user:", userInfo.email)

    // Redirect to a page that will store the tokens client-side
    const redirectUrl = new URL("/career/oauth-success", request.url)
    redirectUrl.searchParams.set("tokens", btoa(JSON.stringify(tokensData)))
    redirectUrl.searchParams.set("email", userInfo.email)

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Error in Google OAuth callback:", error)
    return NextResponse.redirect(new URL("/career?error=callback_failed", request.url))
  }
}
