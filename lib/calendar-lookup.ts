import { openDB } from "idb"

export interface CalendarEvent {
  id: string
  title: string
  start: number
  end: number
  location?: string
  description?: string
}

/**
 * Look up calendar events to resolve meeting references
 */
export async function lookupNextMeeting(): Promise<CalendarEvent | null> {
  try {
    const db = await openDB("ApexDB", 1)
    const now = Date.now()

    // Get all events from calendar store
    const events = await db.getAll("calendar")

    // Find the next upcoming event with a location
    const upcomingEvents = events
      .filter((event: CalendarEvent) => event.start > now && event.location)
      .sort((a: CalendarEvent, b: CalendarEvent) => a.start - b.start)

    return upcomingEvents[0] || null
  } catch (error) {
    console.error("[v0] Calendar lookup error:", error)
    return null
  }
}

/**
 * Look up a meeting by time reference
 */
export async function lookupMeetingByTime(timeStr: string): Promise<CalendarEvent | null> {
  try {
    const db = await openDB("ApexDB", 1)
    const now = Date.now()
    const today = new Date(now)

    // Parse the time string (e.g., "5 PM", "3:30 PM")
    const targetTime = parseTimeString(timeStr, today)
    if (!targetTime) return null

    // Get all events from calendar store
    const events = await db.getAll("calendar")

    // Find event that matches the time (within 30 minutes)
    const matchingEvent = events.find((event: CalendarEvent) => {
      const eventStart = new Date(event.start)
      const timeDiff = Math.abs(eventStart.getTime() - targetTime.getTime())
      return timeDiff < 30 * 60 * 1000 && event.location // Within 30 minutes and has location
    })

    return matchingEvent || null
  } catch (error) {
    console.error("[v0] Calendar time lookup error:", error)
    return null
  }
}

/**
 * Parse time string like "5 PM" or "3:30 PM" into a Date object
 */
function parseTimeString(timeStr: string, baseDate: Date): Date | null {
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!match) return null

  let hours = Number.parseInt(match[1])
  const minutes = match[2] ? Number.parseInt(match[2]) : 0
  const meridiem = match[3]?.toLowerCase()

  // Convert to 24-hour format
  if (meridiem === "pm" && hours < 12) hours += 12
  if (meridiem === "am" && hours === 12) hours = 0

  const result = new Date(baseDate)
  result.setHours(hours, minutes, 0, 0)

  return result
}

/**
 * Get current user location (mock for now, would use Geolocation API)
 */
export async function getCurrentLocation(): Promise<string> {
  // In production, this would use the Geolocation API
  // For now, return a placeholder
  return "current_location"
}
