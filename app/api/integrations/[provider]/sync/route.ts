import { NextResponse } from "next/server"
import { fetchGmailMessages, fetchGoogleDriveFiles } from "@/lib/integrations/google-workspace"
import { fetchStravaActivities, getStravaStats } from "@/lib/integrations/strava"
import { fetchHealthKitData, getHealthKitSummary } from "@/lib/integrations/health-kit"
import { fetchNotionPages, fetchNotionDatabases } from "@/lib/integrations/notion"

export async function POST(request: Request, { params }: { params: { provider: string } }) {
  try {
    const { integrationId, syncType } = await request.json()

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 })
    }

    const { provider } = params

    let data: any

    switch (provider) {
      case "google_workspace":
        if (syncType === "gmail") {
          data = await fetchGmailMessages(integrationId)
        } else if (syncType === "drive") {
          data = await fetchGoogleDriveFiles(integrationId)
        }
        break

      case "strava":
        if (syncType === "activities") {
          data = await fetchStravaActivities(integrationId)
        } else if (syncType === "stats") {
          data = await getStravaStats(integrationId)
        }
        break

      case "health_kit":
        if (syncType === "data") {
          const endDate = new Date()
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - 7)
          data = await fetchHealthKitData(integrationId, startDate, endDate)
        } else if (syncType === "summary") {
          data = await getHealthKitSummary(integrationId)
        }
        break

      case "notion":
        if (syncType === "pages") {
          data = await fetchNotionPages(integrationId)
        } else if (syncType === "databases") {
          data = await fetchNotionDatabases(integrationId)
        }
        break

      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Integration sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
