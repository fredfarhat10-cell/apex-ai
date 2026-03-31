interface AnalyticsEvent {
  id: string
  event: string
  category: string
  timestamp: string
  metadata?: Record<string, any>
}

interface FeatureUsage {
  feature: string
  count: number
  lastUsed: string
  firstUsed: string
}

interface CompletionMetrics {
  onboardingCompleted: boolean
  goalSet: boolean
  firstHabitAdded: boolean
  firstExpenseLogged: boolean
  firstKnowledgeItem: boolean
  firstSimulation: boolean
  auraChanged: boolean
  notificationsEnabled: boolean
}

interface AnalyticsData {
  events: AnalyticsEvent[]
  featureUsage: FeatureUsage[]
  completionMetrics: CompletionMetrics
  sessionCount: number
  totalTimeSpent: number
  lastActive: string
}

const ANALYTICS_KEY = "apex-analytics"
const SESSION_KEY = "apex-session"

export class Analytics {
  private static data: AnalyticsData | null = null

  // Initialize analytics
  static init(): void {
    const stored = localStorage.getItem(ANALYTICS_KEY)
    if (stored) {
      this.data = JSON.parse(stored)
    } else {
      this.data = {
        events: [],
        featureUsage: [],
        completionMetrics: {
          onboardingCompleted: false,
          goalSet: false,
          firstHabitAdded: false,
          firstExpenseLogged: false,
          firstKnowledgeItem: false,
          firstSimulation: false,
          auraChanged: false,
          notificationsEnabled: false,
        },
        sessionCount: 0,
        totalTimeSpent: 0,
        lastActive: new Date().toISOString(),
      }
      this.save()
    }

    this.startSession()
  }

  // Track an event
  static track(event: string, category: string, metadata?: Record<string, any>): void {
    if (!this.data) this.init()

    const analyticsEvent: AnalyticsEvent = {
      id: Date.now().toString(),
      event,
      category,
      timestamp: new Date().toISOString(),
      metadata,
    }

    this.data!.events.push(analyticsEvent)

    // Update feature usage
    const existingFeature = this.data!.featureUsage.find((f) => f.feature === event)
    if (existingFeature) {
      existingFeature.count++
      existingFeature.lastUsed = analyticsEvent.timestamp
    } else {
      this.data!.featureUsage.push({
        feature: event,
        count: 1,
        lastUsed: analyticsEvent.timestamp,
        firstUsed: analyticsEvent.timestamp,
      })
    }

    // Keep only last 1000 events
    if (this.data!.events.length > 1000) {
      this.data!.events = this.data!.events.slice(-1000)
    }

    this.save()
  }

  // Mark completion milestone
  static markComplete(milestone: keyof CompletionMetrics): void {
    if (!this.data) this.init()
    this.data!.completionMetrics[milestone] = true
    this.save()
  }

  // Get completion rate
  static getCompletionRate(): number {
    if (!this.data) this.init()
    const metrics = this.data!.completionMetrics
    const completed = Object.values(metrics).filter((v) => v === true).length
    const total = Object.keys(metrics).length
    return Math.round((completed / total) * 100)
  }

  // Get feature usage stats
  static getFeatureUsage(): FeatureUsage[] {
    if (!this.data) this.init()
    return [...this.data!.featureUsage].sort((a, b) => b.count - a.count)
  }

  // Get events by category
  static getEventsByCategory(category: string): AnalyticsEvent[] {
    if (!this.data) this.init()
    return this.data!.events.filter((e) => e.category === category)
  }

  // Get events by date range
  static getEventsByDateRange(startDate: Date, endDate: Date): AnalyticsEvent[] {
    if (!this.data) this.init()
    return this.data!.events.filter((e) => {
      const eventDate = new Date(e.timestamp)
      return eventDate >= startDate && eventDate <= endDate
    })
  }

  // Get daily active pattern
  static getDailyActivePattern(): { date: string; events: number }[] {
    if (!this.data) this.init()

    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const events = this.getEventsByDateRange(last30Days, new Date())
    const dailyMap = new Map<string, number>()

    events.forEach((event) => {
      const date = event.timestamp.split("T")[0]
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
    })

    return Array.from(dailyMap.entries())
      .map(([date, events]) => ({ date, events }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // Start a new session
  static startSession(): void {
    const sessionData = sessionStorage.getItem(SESSION_KEY)
    if (!sessionData) {
      if (!this.data) this.init()
      this.data!.sessionCount++
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ start: Date.now() }))
      this.save()
    }
  }

  // End session and track time
  static endSession(): void {
    const sessionData = sessionStorage.getItem(SESSION_KEY)
    if (sessionData) {
      const { start } = JSON.parse(sessionData)
      const duration = Date.now() - start
      if (!this.data) this.init()
      this.data!.totalTimeSpent += duration
      this.data!.lastActive = new Date().toISOString()
      sessionStorage.removeItem(SESSION_KEY)
      this.save()
    }
  }

  // Get analytics summary
  static getSummary() {
    if (!this.data) this.init()

    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const recentEvents = this.getEventsByDateRange(last7Days, new Date())

    return {
      totalEvents: this.data!.events.length,
      recentEvents: recentEvents.length,
      sessionCount: this.data!.sessionCount,
      totalTimeSpent: this.data!.totalTimeSpent,
      avgSessionTime: this.data!.sessionCount > 0 ? this.data!.totalTimeSpent / this.data!.sessionCount : 0,
      completionRate: this.getCompletionRate(),
      topFeatures: this.getFeatureUsage().slice(0, 5),
      lastActive: this.data!.lastActive,
    }
  }

  // Export analytics data
  static export(): string {
    if (!this.data) this.init()
    return JSON.stringify(this.data, null, 2)
  }

  // Clear all analytics
  static clear(): void {
    localStorage.removeItem(ANALYTICS_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    this.data = null
    this.init()
  }

  // Save to localStorage
  private static save(): void {
    if (this.data) {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(this.data))
    }
  }
}

// Auto-track page visibility for session management
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      Analytics.endSession()
    } else {
      Analytics.startSession()
    }
  })

  // Track session end on page unload
  window.addEventListener("beforeunload", () => {
    Analytics.endSession()
  })
}
