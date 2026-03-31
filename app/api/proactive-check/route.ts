import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  try {
    const { action, userId } = await request.json()

    if (isDemoMode) {
      // Demo mode: Return mock results
      const mockResults: Record<string, any> = {
        run_financial_analysis: {
          success: true,
          notification: {
            id: `notif_${Date.now()}`,
            type: "morning_architect",
            title: "Financial Analysis Complete",
            message: "Your portfolio is up 2.3% this week. Detected opportunity in tech sector. Consider rebalancing.",
            priority: "medium",
            timestamp: new Date().toISOString(),
            read: false,
          },
        },
        check_goals: {
          success: true,
          notification: {
            id: `notif_${Date.now()}`,
            type: "evening_recovery",
            title: "Goal Progress Update",
            message: "You're 78% toward your Q1 savings goal. On track to exceed target by 12%.",
            priority: "low",
            timestamp: new Date().toISOString(),
            read: false,
          },
        },
        generate_insights: {
          success: true,
          notification: {
            id: `notif_${Date.now()}`,
            type: "overnight_monitor",
            title: "New Insight Detected",
            message:
              "Pattern found: Your productivity peaks on days when you exercise in the morning. Consider scheduling workouts before 9 AM.",
            priority: "high",
            timestamp: new Date().toISOString(),
            read: false,
          },
        },
      }

      return NextResponse.json(mockResults[action] || { success: false, error: "Unknown action" })
    }

    // Live mode: Call CrewAI backend
    const backendUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/proactive-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Proactive check error:", error)
    return NextResponse.json({ success: false, error: "Failed to run proactive check" }, { status: 500 })
  }
}
