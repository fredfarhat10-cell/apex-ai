import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, action, itemType, metadata } = body

    if (!itemId || !action) {
      return NextResponse.json({ success: false, error: "Missing itemId or action" }, { status: 400 })
    }

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (isDemoMode) {
      // In demo mode, just return success
      return NextResponse.json({
        success: true,
        message: `Action '${action}' performed on item ${itemId} (demo mode)`,
        source: "demo",
      })
    }

    // In live mode, call the appropriate backend tool based on item type
    const crewaiUrl = process.env.NEXT_PUBLIC_CREWAI_API_URL || "http://localhost:5000"

    let toolEndpoint = ""
    let toolAction = ""

    switch (itemType) {
      case "email":
        toolEndpoint = "/api/tools/email"
        if (action === "done") {
          toolAction = "mark_as_read"
        } else if (action === "snooze") {
          toolAction = "snooze_thread"
        }
        break
      case "calendar":
        toolEndpoint = "/api/tools/calendar"
        if (action === "done") {
          toolAction = "accept_event"
        } else if (action === "snooze") {
          toolAction = "snooze_event"
        }
        break
      case "notion":
        toolEndpoint = "/api/tools/notion"
        if (action === "done") {
          toolAction = "update_task_status"
        } else if (action === "snooze") {
          toolAction = "snooze_task"
        }
        break
      default:
        return NextResponse.json({ success: false, error: "Unknown item type" }, { status: 400 })
    }

    const response = await fetch(`${crewaiUrl}${toolEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: toolAction,
        item_id: itemId,
        metadata: metadata || {},
        user_id: request.headers.get("x-user-id") || "default-user",
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: `Action '${action}' performed successfully`,
      data,
      source: "live",
    })
  } catch (error) {
    console.error("[v0] Error performing triage action:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
