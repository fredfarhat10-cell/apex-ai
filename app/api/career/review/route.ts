import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_name, career_quest } = body

    if (!user_name || !career_quest) {
      return NextResponse.json({ error: "Missing required fields: user_name, career_quest" }, { status: 400 })
    }

    // Call CrewAI backend to generate quarterly career review
    const crewaiUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${crewaiUrl}/api/career/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name,
        career_quest,
        task: "conduct_quarterly_career_review",
      }),
    })

    if (!response.ok) {
      throw new Error(`CrewAI backend error: ${response.statusText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      review: result,
    })
  } catch (error) {
    console.error("Error generating career review:", error)
    return NextResponse.json({ error: "Failed to generate career review" }, { status: 500 })
  }
}
