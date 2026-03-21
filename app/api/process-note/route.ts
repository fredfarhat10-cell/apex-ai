import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { note } = await request.json()

    if (!note || typeof note !== "string" || !note.trim()) {
      return NextResponse.json({ success: false, error: "Invalid note content" }, { status: 400 })
    }

    // Call CrewAI backend to process the unstructured note
    const crewaiUrl = process.env.CREWAI_API_URL || "http://localhost:8000"
    const response = await fetch(`${crewaiUrl}/api/process-note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: note.trim(),
        user_id: "current-user", // In production, get from session
      }),
    })

    if (!response.ok) {
      throw new Error(`CrewAI API error: ${response.statusText}`)
    }

    const data = await response.json()

    // The CrewAI backend should return a structured JSON array of actions
    // Example: [{ action_type: "create_reminder", payload: {...} }, ...]
    const actions = data.actions || []

    return NextResponse.json({
      success: true,
      actions,
      message: `Processed ${actions.length} action(s) from your note`,
    })
  } catch (error) {
    console.error("[v0] Error processing note:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process note",
      },
      { status: 500 },
    )
  }
}
