import { NextResponse } from "next/server"
import {
  getAllIntegrations,
  getIntegrationStats,
  disconnectIntegration,
  getAvailableProviders,
} from "@/lib/integration-manager"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "stats") {
      const stats = await getIntegrationStats()
      return NextResponse.json({ stats })
    }

    if (action === "providers") {
      const providers = getAvailableProviders()
      return NextResponse.json({ providers })
    }

    const integrations = await getAllIntegrations()
    return NextResponse.json({ integrations })
  } catch (error) {
    console.error("[v0] Integration API error:", error)
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { integrationId } = await request.json()

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 })
    }

    await disconnectIntegration(integrationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Integration disconnect error:", error)
    return NextResponse.json({ error: "Failed to disconnect integration" }, { status: 500 })
  }
}
