import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventDetails, userLocation } = await request.json()

    // Call CrewAI backend to run proactive_travel_management task
    const crewResponse = await fetch("http://localhost:8000/api/crew/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "proactive_travel_management",
        inputs: {
          event_details: eventDetails,
          user_location: userLocation,
        },
      }),
    })

    if (!crewResponse.ok) {
      throw new Error("Failed to run logistics check")
    }

    const result = await crewResponse.json()

    return NextResponse.json({
      success: true,
      alert: result.alert,
      recommendation: result.recommendation,
    })
  } catch (error) {
    console.error("Error checking lateness:", error)
    return NextResponse.json({ error: "Failed to check lateness risk" }, { status: 500 })
  }
}
