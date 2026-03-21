import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const code = formData.get("code") as string
    const idToken = formData.get("id_token") as string
    const error = formData.get("error") as string

    if (error) {
      console.error("[v0] Apple OAuth error:", error)
      return NextResponse.redirect(new URL(`/auth-demo?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code || !idToken) {
      return NextResponse.redirect(new URL("/auth-demo?error=no_code", request.url))
    }

    // Decode the ID token to get user info (simplified - in production, verify the JWT)
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString())

    // Redirect to success page
    const redirectUrl = new URL("/auth-demo", request.url)
    redirectUrl.searchParams.set("provider", "apple")
    redirectUrl.searchParams.set("success", "true")
    redirectUrl.searchParams.set("user", btoa(JSON.stringify({ email: payload.email, sub: payload.sub })))

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Error in Apple OAuth callback:", error)
    return NextResponse.redirect(new URL("/auth-demo?error=callback_failed", request.url))
  }
}
