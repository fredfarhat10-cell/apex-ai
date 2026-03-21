import { type NextRequest, NextResponse } from "next/server"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// Mock Aura data for demo mode
const mockAuraProfile = {
  moodState: "Balanced",
  auraScore: 72,
  confidence: 85,
  stressIndicators: [
    "Busy schedule (6 meetings) - moderate load",
    "Below-average productivity (65%) - slight struggle",
  ],
  positiveIndicators: ["Excellent sleep quality (88%)", "Positive email interactions", "Spending within normal range"],
  toneRecommendation: "Supportive and strategic - standard approach",
  priorityAdjustment: "No adjustment needed, user is functioning well",
  proactiveSupport: "Consider scheduling a recovery break after the 3pm meeting cluster",
  timestamp: new Date().toISOString(),
}

export async function POST(request: NextRequest) {
  if (isDemoMode) {
    // Demo mode: return mock data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return NextResponse.json({
      success: true,
      aura: mockAuraProfile,
    })
  }

  try {
    // Live mode: call CrewAI backend
    const { userId } = await request.json()

    const backendUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/aura/infer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error("Backend request failed")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Aura API error:", error)

    // Fallback to mock data on error
    return NextResponse.json({
      success: true,
      aura: mockAuraProfile,
      fallback: true,
    })
  }
}
