import { NextResponse } from "next/server"
import type { CalendarEvent } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { events, userId } = await request.json()

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid events data" }, { status: 400 })
    }

    const now = new Date()
    const generatedReminders: any[] = []

    for (const event of events as CalendarEvent[]) {
      const eventStart = new Date(event.startTime)
      const timeUntilEvent = eventStart.getTime() - now.getTime()
      const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60)
      const daysUntilEvent = timeUntilEvent / (1000 * 60 * 60 * 24)

      // Multi-stage reminder logic based on priority
      if (event.priority === "critical") {
        // 3 days before: Preparation reminder
        if (daysUntilEvent <= 3 && daysUntilEvent > 2.9) {
          generatedReminders.push({
            id: `reminder-${event.id}-prep`,
            text: `Preparation: "${event.title}" is in 3 days. Start preparing now.`,
            dueDate: new Date(eventStart.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            priority: "high",
            eventId: event.id,
          })
        }

        // 1 day before: Final check reminder
        if (daysUntilEvent <= 1 && daysUntilEvent > 0.9) {
          generatedReminders.push({
            id: `reminder-${event.id}-final`,
            text: `Final Check: "${event.title}" is tomorrow. Review all materials.`,
            dueDate: new Date(eventStart.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            priority: "high",
            eventId: event.id,
          })
        }

        // 2 hours before: Upcoming reminder
        if (hoursUntilEvent <= 2 && hoursUntilEvent > 1.9) {
          generatedReminders.push({
            id: `reminder-${event.id}-upcoming`,
            text: `Upcoming: "${event.title}" starts in 2 hours. Get ready.`,
            dueDate: new Date(eventStart.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            completed: false,
            priority: "high",
            eventId: event.id,
          })
        }

        // 15 minutes before: Urgent notification
        if (hoursUntilEvent <= 0.25 && hoursUntilEvent > 0.2) {
          generatedReminders.push({
            id: `reminder-${event.id}-urgent`,
            text: `URGENT: "${event.title}" starts in 15 minutes!`,
            dueDate: new Date(eventStart.getTime() - 15 * 60 * 1000).toISOString(),
            completed: false,
            priority: "critical",
            eventId: event.id,
            urgent: true,
          })
        }
      } else if (event.priority === "normal") {
        // 1 hour before: Standard reminder
        if (hoursUntilEvent <= 1 && hoursUntilEvent > 0.9) {
          generatedReminders.push({
            id: `reminder-${event.id}-standard`,
            text: `Reminder: "${event.title}" starts in 1 hour.`,
            dueDate: new Date(eventStart.getTime() - 60 * 60 * 1000).toISOString(),
            completed: false,
            priority: "normal",
            eventId: event.id,
          })
        }
      }

      // Weekly recurring events: Summary the night before
      if (event.isRecurring && daysUntilEvent <= 1 && daysUntilEvent > 0.8) {
        generatedReminders.push({
          id: `reminder-${event.id}-recurring`,
          text: `Tomorrow: Recurring event "${event.title}"`,
          dueDate: new Date(eventStart.getTime() - 12 * 60 * 60 * 1000).toISOString(),
          completed: false,
          priority: "normal",
          eventId: event.id,
        })
      }
    }

    return NextResponse.json({
      success: true,
      reminders: generatedReminders,
      count: generatedReminders.length,
    })
  } catch (error) {
    console.error("[v0] Error processing reminders:", error)
    return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 })
  }
}
