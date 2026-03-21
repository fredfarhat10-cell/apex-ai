import { NextResponse } from "next/server"
import {
  getActivePersonality,
  setActivePersonality,
  recordPersonalityFeedback,
  getPersonalityStats,
  getRecommendedPersonality,
} from "@/lib/personality-engine"
import { getAllPersonalityProfiles } from "@/lib/personality-profiles"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "profiles") {
      const profiles = getAllPersonalityProfiles()
      return NextResponse.json({ profiles })
    }

    if (action === "stats") {
      const stats = await getPersonalityStats()
      return NextResponse.json({ stats })
    }

    if (action === "recommended") {
      const recommended = await getRecommendedPersonality()
      return NextResponse.json({ recommended })
    }

    const personality = await getActivePersonality()
    return NextResponse.json({ personality })
  } catch (error) {
    console.error("[v0] Personality API error:", error)
    return NextResponse.json({ error: "Failed to fetch personality" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, profileId, feedback } = await request.json()

    if (action === "set") {
      if (!profileId) {
        return NextResponse.json({ error: "Profile ID required" }, { status: 400 })
      }
      await setActivePersonality(profileId)
      return NextResponse.json({ success: true })
    }

    if (action === "feedback") {
      if (!feedback) {
        return NextResponse.json({ error: "Feedback required" }, { status: 400 })
      }
      await recordPersonalityFeedback(feedback)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Personality API error:", error)
    return NextResponse.json({ error: "Failed to update personality" }, { status: 500 })
  }
}
