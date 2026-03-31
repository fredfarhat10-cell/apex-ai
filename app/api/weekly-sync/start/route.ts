import { type NextRequest, NextResponse } from "next/server"
import type { WeeklySyncSession } from "@/lib/types/weekly-sync"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Calculate week boundaries (Sunday to Saturday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const weekStartDate = new Date(now)
    weekStartDate.setDate(now.getDate() - dayOfWeek)
    weekStartDate.setHours(0, 0, 0, 0)

    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 6)
    weekEndDate.setHours(23, 59, 59, 999)

    const session: WeeklySyncSession = {
      id: `sync-${Date.now()}`,
      userId,
      weekStartDate: weekStartDate.toISOString(),
      weekEndDate: weekEndDate.toISOString(),
      phase: "after-action",
      createdAt: new Date().toISOString(),
    }

    // Store session in IndexedDB (client-side will handle this)
    return NextResponse.json({ session })
  } catch (error) {
    console.error("[v0] Error starting weekly sync:", error)
    return NextResponse.json({ error: "Failed to start weekly sync session" }, { status: 500 })
  }
}
