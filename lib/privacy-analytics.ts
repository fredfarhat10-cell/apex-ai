"use client"

export interface AnalyticsEvent {
  id: string
  type: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: string
  sessionId: string
}

export interface AnalyticsSummary {
  totalEvents: number
  uniqueSessions: number
  topActions: { action: string; count: number }[]
  categoryBreakdown: { category: string; count: number }[]
  lastUpdated: string
}

const EVENTS_KEY = "apex_analytics_events"
const SESSION_KEY = "apex_session_id"
const ANALYTICS_PREFS_KEY = "apex_analytics_preferences"

export interface AnalyticsPreferences {
  enabled: boolean
  shareAggregated: boolean // Opt-in to share anonymized data
}

export function getAnalyticsPreferences(): AnalyticsPreferences {
  if (typeof window === "undefined") return { enabled: true, shareAggregated: false }

  const stored = localStorage.getItem(ANALYTICS_PREFS_KEY)
  if (!stored) return { enabled: true, shareAggregated: false }

  return JSON.parse(stored)
}

export function updateAnalyticsPreferences(prefs: Partial<AnalyticsPreferences>) {
  if (typeof window === "undefined") return

  const current = getAnalyticsPreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem(ANALYTICS_PREFS_KEY, JSON.stringify(updated))
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

export function trackEvent(
  type: string,
  category: string,
  action: string,
  label?: string,
  value?: number,
): AnalyticsEvent | null {
  const prefs = getAnalyticsPreferences()
  if (!prefs.enabled) return null

  const event: AnalyticsEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    category,
    action,
    label,
    value,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  }

  const events = getEvents()
  events.push(event)

  // Keep only last 1000 events to prevent storage bloat
  const trimmedEvents = events.slice(-1000)
  localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmedEvents))

  console.log("[v0] Analytics event tracked:", event)
  return event
}

export function getEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(EVENTS_KEY)
  if (!stored) return []

  return JSON.parse(stored)
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getEvents()
  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size

  // Count actions
  const actionCounts: { [key: string]: number } = {}
  const categoryCounts: { [key: string]: number } = {}

  events.forEach((event) => {
    actionCounts[event.action] = (actionCounts[event.action] || 0) + 1
    categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1
  })

  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalEvents: events.length,
    uniqueSessions,
    topActions,
    categoryBreakdown,
    lastUpdated: new Date().toISOString(),
  }
}

export function clearAnalytics() {
  if (typeof window === "undefined") return
  localStorage.removeItem(EVENTS_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function exportAnalytics(): string {
  const events = getEvents()
  const summary = getAnalyticsSummary()
  const prefs = getAnalyticsPreferences()

  return JSON.stringify(
    {
      preferences: prefs,
      summary,
      events,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}
