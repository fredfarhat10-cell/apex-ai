import { type NextRequest, NextResponse } from "next/server"
import { GoogleOAuthClient } from "@/lib/google-oauth"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const oauthClient = new GoogleOAuthClient()
    await oauthClient.revokeToken(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error revoking Google token:", error)
    return NextResponse.json({ error: "Failed to revoke token" }, { status: 500 })
  }
}
