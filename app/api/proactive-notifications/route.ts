import { type NextRequest, NextResponse } from "next/server"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// Mock proactive notifications for demo mode
const generateMockNotifications = () => {
  const now = new Date()
  const hour = now.getHours()

  const notifications = []

  // Morning Architect (6 AM - 10 AM)
  if (hour >= 6 && hour < 10) {
    notifications.push({
      id: "morning-1",
      type: "morning_architect",
      title: "Good Morning - Your Day is Architected",
      message:
        "I've analyzed your calendar and energy patterns. Your 3-hour deep work window from 9-12 is optimal for complex tasks.",
      priority: "high",
      timestamp: new Date(now.setHours(6, 30, 0, 0)).toISOString(),
      read: false,
    })
  }

  // Overnight Monitor (any time - shows insights from last night)
  notifications.push({
    id: "overnight-1",
    type: "overnight_monitor",
    title: "Overnight Analysis Complete",
    message: "Your portfolio gained 1.8% overnight. Sleep quality was excellent (88%). No urgent actions required.",
    priority: "medium",
    timestamp: new Date(now.setHours(5, 0, 0, 0)).toISOString(),
    read: false,
  })

  // Evening Recovery (6 PM - 11 PM)
  if (hour >= 18 && hour < 23) {
    notifications.push({
      id: "evening-1",
      type: "evening_recovery",
      title: "Evening Wind-Down Recommendation",
      message: "You completed 4 of 5 habits today. Consider a 10-minute meditation to optimize tomorrow's performance.",
      priority: "low",
      timestamp: new Date(now.setHours(19, 0, 0, 0)).toISOString(),
      read: false,
    })
  }

  // Proactive travel alert (example)
  if (hour >= 8 && hour < 18) {
    notifications.push({
      id: "travel-1",
      type: "morning_architect",
      title: "Meeting in 2 Hours - Travel Alert",
      message:
        "Your 2 PM meeting is 45 minutes away. Current traffic suggests leaving in 30 minutes to arrive on time.",
      priority: "high",
      timestamp: new Date(now.setHours(hour, 0, 0, 0)).toISOString(),
      read: false,
    })
  }

  return notifications
}

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    // Store notification in database or send push notification
    console.log("[v0] Proactive notification received:", notification)

    // TODO: Implement push notification service
    // TODO: Store in database for user to view later

    return NextResponse.json({
      success: true,
      message: "Notification received",
    })
  } catch (error) {
    console.error("[v0] Error processing proactive notification:", error)
    return NextResponse.json({ error: "Failed to process notification" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (isDemoMode) {
    // Demo mode: return time-appropriate mock notifications
    const notifications = generateMockNotifications()
    return NextResponse.json({ notifications })
  }

  try {
    // Live mode: fetch from backend
    const backendUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/notifications/proactive`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error("Backend request failed")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)

    // Fallback to mock data on error
    const notifications = generateMockNotifications()
    return NextResponse.json({ notifications, fallback: true })
  }
}
