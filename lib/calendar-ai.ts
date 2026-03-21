import type { CalendarEvent } from "./types"

export interface SchedulingSuggestion {
  id: string
  type: "optimal_time" | "conflict" | "buffer" | "optimization" | "preparation"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  action?: () => void
  suggestedTime?: string
}

export interface ConflictDetection {
  hasConflict: boolean
  conflictingEvents: CalendarEvent[]
  suggestions: string[]
}

export class CalendarAI {
  /**
   * Analyzes user's calendar patterns to determine optimal scheduling times
   */
  static analyzeOptimalTimes(events: CalendarEvent[], userProfile?: any): SchedulingSuggestion[] {
    const suggestions: SchedulingSuggestion[] = []

    // Analyze event distribution by hour
    const hourDistribution = new Map<number, number>()
    events.forEach((event) => {
      const hour = new Date(event.startTime).getHours()
      hourDistribution.set(hour, (hourDistribution.get(hour) || 0) + 1)
    })

    // Find least busy hours
    const leastBusyHours = Array.from(hourDistribution.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map((entry) => entry[0])

    if (leastBusyHours.length > 0) {
      const hour = leastBusyHours[0]
      const timeLabel = hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`

      suggestions.push({
        id: "optimal-time-1",
        type: "optimal_time",
        priority: "medium",
        title: "Optimal Focus Time Detected",
        description: `Your calendar shows ${timeLabel} is typically your least scheduled time. Consider blocking this for deep work.`,
      })
    }

    // Check for back-to-back meetings
    const sortedEvents = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    let backToBackCount = 0
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEnd = new Date(sortedEvents[i].endTime)
      const nextStart = new Date(sortedEvents[i + 1].startTime)
      const gap = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60) // minutes

      if (gap < 15) {
        backToBackCount++
      }
    }

    if (backToBackCount > 2) {
      suggestions.push({
        id: "buffer-suggestion-1",
        type: "buffer",
        priority: "high",
        title: "Add Buffer Time",
        description: `You have ${backToBackCount} back-to-back events. Consider adding 15-minute buffers to prevent burnout and allow for transitions.`,
      })
    }

    // Analyze work-life balance
    const workEvents = events.filter((e) => e.category === "Work").length
    const personalEvents = events.filter((e) => e.category === "Personal").length

    if (workEvents > personalEvents * 3) {
      suggestions.push({
        id: "balance-suggestion-1",
        type: "optimization",
        priority: "medium",
        title: "Work-Life Balance Alert",
        description: `Your calendar is heavily weighted toward work (${workEvents} work vs ${personalEvents} personal events). Consider scheduling personal time.`,
      })
    }

    return suggestions
  }

  /**
   * Detects scheduling conflicts
   */
  static detectConflicts(events: CalendarEvent[], newEvent?: CalendarEvent): ConflictDetection {
    if (!newEvent) {
      return { hasConflict: false, conflictingEvents: [], suggestions: [] }
    }

    const newStart = new Date(newEvent.startTime)
    const newEnd = new Date(newEvent.endTime)

    const conflictingEvents = events.filter((event) => {
      if (event.id === newEvent.id) return false

      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)

      // Check for overlap
      return (
        (newStart >= eventStart && newStart < eventEnd) ||
        (newEnd > eventStart && newEnd <= eventEnd) ||
        (newStart <= eventStart && newEnd >= eventEnd)
      )
    })

    const suggestions: string[] = []

    if (conflictingEvents.length > 0) {
      // Suggest alternative times
      const conflictEnd = new Date(Math.max(...conflictingEvents.map((e) => new Date(e.endTime).getTime())))
      const suggestedTime = new Date(conflictEnd.getTime() + 15 * 60 * 1000) // 15 min after conflict ends

      suggestions.push(
        `Reschedule to ${suggestedTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      )
      suggestions.push("Move conflicting event to a different time")
      suggestions.push("Shorten event duration to avoid overlap")
    }

    return {
      hasConflict: conflictingEvents.length > 0,
      conflictingEvents,
      suggestions,
    }
  }

  /**
   * Auto-categorizes events based on title and description
   */
  static autoCategorize(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase()

    // Work-related keywords
    if (
      text.match(
        /meeting|standup|sync|review|presentation|client|project|deadline|sprint|scrum|call|conference|workshop/,
      )
    ) {
      return "Work"
    }

    // Health-related keywords
    if (text.match(/gym|workout|exercise|doctor|dentist|therapy|yoga|run|fitness|health|medical/)) {
      return "Health"
    }

    // Social keywords
    if (text.match(/dinner|lunch|coffee|party|birthday|celebration|hangout|drinks|friends|family/)) {
      return "Social"
    }

    // Default to Personal
    return "Personal"
  }

  /**
   * Generates meeting preparation insights
   */
  static generateMeetingPrep(event: CalendarEvent, relatedEvents: CalendarEvent[]): SchedulingSuggestion | null {
    const now = new Date()
    const eventStart = new Date(event.startTime)
    const hoursUntil = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Only suggest prep for upcoming events within 24 hours
    if (hoursUntil < 0 || hoursUntil > 24) return null

    if (event.category === "Work" && event.title.toLowerCase().includes("meeting")) {
      return {
        id: `prep-${event.id}`,
        type: "preparation",
        priority: hoursUntil < 2 ? "high" : "medium",
        title: `Prepare for: ${event.title}`,
        description: `This meeting starts in ${Math.round(hoursUntil)} hours. Review relevant documents and prepare your talking points.`,
      }
    }

    return null
  }

  /**
   * Suggests time blocks for focused work
   */
  static suggestFocusBlocks(events: CalendarEvent[]): SchedulingSuggestion[] {
    const suggestions: SchedulingSuggestion[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get events for the next 7 days
    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.startTime)
      const daysDiff = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff >= 0 && daysDiff < 7
    })

    // Find gaps of 2+ hours
    const sortedEvents = [...upcomingEvents].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEnd = new Date(sortedEvents[i].endTime)
      const nextStart = new Date(sortedEvents[i + 1].startTime)
      const gapHours = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60)

      if (gapHours >= 2) {
        suggestions.push({
          id: `focus-block-${i}`,
          type: "optimization",
          priority: "medium",
          title: "Focus Block Opportunity",
          description: `You have a ${Math.floor(gapHours)}-hour gap on ${currentEnd.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}. Perfect for deep work.`,
          suggestedTime: currentEnd.toISOString(),
        })
      }
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }

  /**
   * Analyzes productivity patterns
   */
  static analyzeProductivityPatterns(events: CalendarEvent[]): {
    busiestDay: string
    busiestHour: number
    averageEventsPerDay: number
    categoryBreakdown: Record<string, number>
  } {
    const dayCount = new Map<string, number>()
    const hourCount = new Map<number, number>()
    const categoryCount: Record<string, number> = {}

    events.forEach((event) => {
      const date = new Date(event.startTime)
      const day = date.toLocaleDateString("en-US", { weekday: "long" })
      const hour = date.getHours()

      dayCount.set(day, (dayCount.get(day) || 0) + 1)
      hourCount.set(hour, (hourCount.get(hour) || 0) + 1)
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1
    })

    const busiestDay = Array.from(dayCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data"

    const busiestHour = Array.from(hourCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 9

    const averageEventsPerDay = events.length / 7

    return {
      busiestDay,
      busiestHour,
      averageEventsPerDay,
      categoryBreakdown: categoryCount,
    }
  }
}
