import { type NextRequest, NextResponse } from "next/server"
import { GoogleOAuthClient } from "@/lib/google-oauth"

export async function GET(request: NextRequest) {
  try {
    const oauthClient = new GoogleOAuthClient()
    const authUrl = oauthClient.getAuthUrl()

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("[v0] Error generating Google auth URL:", error)
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 })
  }
}
