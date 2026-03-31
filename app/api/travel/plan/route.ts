import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { destination, startDate, endDate, travelers, budget, interests, preferences } = body

    // Validate required fields
    if (!destination || !startDate || !endDate || !travelers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call CrewAI backend to generate travel plan
    const crewAIUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${crewAIUrl}/api/travel/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        travel_request: `Plan a trip to ${destination} from ${startDate} to ${endDate} for ${travelers} travelers`,
        user_name: "User", // Get from session/auth
        destination,
        start_date: startDate,
        end_date: endDate,
        travelers,
        budget,
        interests: interests || [],
        preferences: preferences || {},
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate travel plan")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      itinerary: data.itinerary,
      taskId: data.task_id,
    })
  } catch (error) {
    console.error("Error planning travel:", error)
    return NextResponse.json({ error: "Failed to plan travel" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    // Check status of travel planning task
    const crewAIUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${crewAIUrl}/api/travel/status/${taskId}`)

    if (!response.ok) {
      throw new Error("Failed to get task status")
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error checking travel plan status:", error)
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
  }
}
