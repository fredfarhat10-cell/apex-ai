import type { AppState, TrendAnalysis, MoodEntry, CalendarEvent } from "./types"

export class TrendAnalyzer {
  // Analyze spending patterns over time
  static analyzeSpending(expenses: AppState["expenses"]): "increasing" | "decreasing" | "stable" {
    if (expenses.length < 2) return "stable"

    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Group by week
    const weeklyTotals: number[] = []
    let currentWeek: number[] = []
    let currentWeekStart = new Date(sortedExpenses[0].date)

    sortedExpenses.forEach((expense) => {
      const expenseDate = new Date(expense.date)
      const daysDiff = Math.floor((expenseDate.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff > 7) {
        if (currentWeek.length > 0) {
          weeklyTotals.push(currentWeek.reduce((sum, amt) => sum + amt, 0))
        }
        currentWeek = [expense.amount]
        currentWeekStart = expenseDate
      } else {
        currentWeek.push(expense.amount)
      }
    })

    if (currentWeek.length > 0) {
      weeklyTotals.push(currentWeek.reduce((sum, amt) => sum + amt, 0))
    }

    if (weeklyTotals.length < 2) return "stable"

    // Calculate trend using simple linear regression
    const trend = this.calculateTrend(weeklyTotals)
    if (trend > 0.1) return "increasing"
    if (trend < -0.1) return "decreasing"
    return "stable"
  }

  // Calculate habit completion rate
  static analyzeHabits(habits: AppState["habits"], habitLogs: AppState["habitLogs"]): number {
    if (habits.length === 0) return 0

    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const recentLogs = habitLogs.filter((log) => new Date(log.date) >= last30Days)

    if (recentLogs.length === 0) return 0

    const completedLogs = recentLogs.filter((log) => log.completed).length
    return Math.round((completedLogs / recentLogs.length) * 100)
  }

  // Analyze productivity trend based on habits and knowledge growth
  static analyzeProductivity(
    habits: AppState["habits"],
    habitLogs: AppState["habitLogs"],
    knowledgeItems: AppState["knowledgeItems"],
  ): "improving" | "declining" | "stable" {
    const completionRate = this.analyzeHabits(habits, habitLogs)

    // Check knowledge growth in last 30 days
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const recentKnowledge = knowledgeItems.filter((item) => new Date(item.createdAt) >= last30Days)

    // Combine metrics
    if (completionRate > 70 && recentKnowledge.length > 5) return "improving"
    if (completionRate < 40 && recentKnowledge.length < 2) return "declining"
    return "stable"
  }

  // Analyze stress pattern from mood history
  static analyzeStress(moodHistory: MoodEntry[]): "high" | "moderate" | "low" {
    if (moodHistory.length === 0) return "moderate"

    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const recentMoods = moodHistory.filter((mood) => new Date(mood.timestamp) >= last7Days)

    if (recentMoods.length === 0) return "moderate"

    const avgStress = recentMoods.reduce((sum, mood) => sum + mood.stress, 0) / recentMoods.length

    if (avgStress >= 4) return "high"
    if (avgStress <= 2) return "low"
    return "moderate"
  }

  static analyzeCalendar(calendarEvents: CalendarEvent[]): {
    busyLevel: "overloaded" | "busy" | "balanced" | "light"
    workLifeBalance: "poor" | "fair" | "good"
    upcomingDeadlines: number
  } {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const upcomingEvents = calendarEvents.filter((event) => {
      const eventDate = new Date(event.startTime)
      return eventDate >= today && eventDate <= nextWeek
    })

    // Calculate busy level based on events per day
    const eventsPerDay = upcomingEvents.length / 7
    let busyLevel: "overloaded" | "busy" | "balanced" | "light"
    if (eventsPerDay > 8) busyLevel = "overloaded"
    else if (eventsPerDay > 5) busyLevel = "busy"
    else if (eventsPerDay > 2) busyLevel = "balanced"
    else busyLevel = "light"

    // Calculate work-life balance
    const workEvents = upcomingEvents.filter((e) => e.category === "Work").length
    const personalEvents = upcomingEvents.filter((e) => e.category === "Personal" || e.category === "Social").length
    const ratio = personalEvents / (workEvents || 1)

    let workLifeBalance: "poor" | "fair" | "good"
    if (ratio < 0.3) workLifeBalance = "poor"
    else if (ratio < 0.6) workLifeBalance = "fair"
    else workLifeBalance = "good"

    // Count upcoming deadlines (events with "deadline" or "due" in title)
    const upcomingDeadlines = upcomingEvents.filter(
      (e) => e.title.toLowerCase().includes("deadline") || e.title.toLowerCase().includes("due"),
    ).length

    return { busyLevel, workLifeBalance, upcomingDeadlines }
  }

  // Generate personalized recommendations
  static generateRecommendations(state: AppState): string[] {
    const recommendations: string[] = []

    const spendingPattern = this.analyzeSpending(state.expenses)
    const habitRate = this.analyzeHabits(state.habits, state.habitLogs)
    const stressLevel = this.analyzeStress(state.moodHistory)
    const calendarAnalysis = this.analyzeCalendar(state.calendarEvents || [])

    if (spendingPattern === "increasing") {
      recommendations.push("Your spending is trending up. Consider reviewing your budget categories.")
    }

    if (habitRate < 50) {
      recommendations.push("Habit completion is below 50%. Try starting with smaller, easier habits.")
    }

    if (stressLevel === "high") {
      recommendations.push("Stress levels are elevated. Schedule breaks and consider mindfulness exercises.")
    }

    if (state.knowledgeItems.length > 20 && !state.knowledgeItems.some((item) => item.summary)) {
      recommendations.push("You have many notes. Try using AI summarization to organize your knowledge.")
    }

    if (state.aura === "Tired" && habitRate > 70) {
      recommendations.push("You're maintaining habits despite low energy. Great resilience! Consider rest.")
    }

    if (calendarAnalysis.busyLevel === "overloaded") {
      recommendations.push("Your calendar is overloaded this week. Consider rescheduling non-critical meetings.")
    }

    if (calendarAnalysis.workLifeBalance === "poor") {
      recommendations.push("Work-life balance needs attention. Schedule personal time to recharge.")
    }

    if (calendarAnalysis.upcomingDeadlines > 3) {
      recommendations.push(
        `You have ${calendarAnalysis.upcomingDeadlines} deadlines approaching. Prioritize accordingly.`,
      )
    }

    return recommendations
  }

  // Perform full trend analysis
  static analyze(state: AppState): TrendAnalysis {
    return {
      spendingPattern: this.analyzeSpending(state.expenses),
      habitCompletionRate: this.analyzeHabits(state.habits, state.habitLogs),
      productivityTrend: this.analyzeProductivity(state.habits, state.habitLogs, state.knowledgeItems),
      stressPattern: this.analyzeStress(state.moodHistory),
      recommendations: this.generateRecommendations(state),
      lastUpdated: new Date().toISOString(),
    }
  }

  // Helper: Calculate trend using simple linear regression
  private static calculateTrend(values: number[]): number {
    const n = values.length
    const xSum = (n * (n - 1)) / 2
    const ySum = values.reduce((sum, val) => sum + val, 0)
    const xySum = values.reduce((sum, val, i) => sum + i * val, 0)
    const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum)
    return slope
  }
}
