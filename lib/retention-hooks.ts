"use client"

export interface RetentionNudge {
  id: string
  type: "habit-reminder" | "practice-prompt" | "milestone-celebration" | "tip"
  title: string
  message: string
  actionLabel?: string
  actionUrl?: string
  priority: "high" | "medium" | "low"
  createdAt: string
  dismissedAt?: string
}

export interface HabitTemplate {
  id: string
  name: string
  description: string
  category: string
  frequency: "daily" | "weekly" | "custom"
  icon: string
}

const NUDGES_KEY = "apex_retention_nudges"
const LAST_ACTIVITY_KEY = "apex_last_activity"
const NUDGE_PREFERENCES_KEY = "apex_nudge_preferences"

export interface NudgePreferences {
  enabled: boolean
  quietHoursStart?: string // HH:MM format
  quietHoursEnd?: string // HH:MM format
  maxPerDay: number
}

export function getNudgePreferences(): NudgePreferences {
  if (typeof window === "undefined") return { enabled: true, maxPerDay: 3 }

  const stored = localStorage.getItem(NUDGE_PREFERENCES_KEY)
  if (!stored) return { enabled: true, maxPerDay: 3 }

  return JSON.parse(stored)
}

export function updateNudgePreferences(prefs: Partial<NudgePreferences>) {
  if (typeof window === "undefined") return

  const current = getNudgePreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem(NUDGE_PREFERENCES_KEY, JSON.stringify(updated))
}

export function getActiveNudges(): RetentionNudge[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(NUDGES_KEY)
  if (!stored) return []

  const nudges: RetentionNudge[] = JSON.parse(stored)
  return nudges.filter((n) => !n.dismissedAt)
}

export function addNudge(nudge: Omit<RetentionNudge, "id" | "createdAt">): RetentionNudge {
  const newNudge: RetentionNudge = {
    ...nudge,
    id: `nudge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }

  const nudges = getActiveNudges()
  nudges.push(newNudge)
  localStorage.setItem(NUDGES_KEY, JSON.stringify(nudges))

  return newNudge
}

export function dismissNudge(id: string) {
  const nudges = JSON.parse(localStorage.getItem(NUDGES_KEY) || "[]")
  const updated = nudges.map((n: RetentionNudge) => (n.id === id ? { ...n, dismissedAt: new Date().toISOString() } : n))
  localStorage.setItem(NUDGES_KEY, JSON.stringify(updated))
}

export function updateLastActivity() {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString())
}

export function getDaysSinceLastActivity(): number {
  if (typeof window === "undefined") return 0

  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
  if (!lastActivity) return 0

  const lastDate = new Date(lastActivity)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - lastDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function checkForNudges(habits: any[], habitLogs: any[]): RetentionNudge | null {
  const prefs = getNudgePreferences()
  if (!prefs.enabled) return null

  const daysSinceActivity = getDaysSinceLastActivity()
  const todayNudges = getActiveNudges().filter((n) => {
    const createdToday = new Date(n.createdAt).toDateString() === new Date().toDateString()
    return createdToday
  })

  // Check max nudges per day
  if (todayNudges.length >= prefs.maxPerDay) return null

  // Check quiet hours
  if (prefs.quietHoursStart && prefs.quietHoursEnd) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    if (currentTime >= prefs.quietHoursStart && currentTime <= prefs.quietHoursEnd) {
      return null
    }
  }

  // Generate contextual nudge based on activity
  if (daysSinceActivity >= 3) {
    return {
      id: "",
      type: "practice-prompt",
      title: "We Miss You!",
      message: `It's been ${daysSinceActivity} days since your last session. Ready for a quick 15-minute practice?`,
      actionLabel: "Start Session",
      actionUrl: "/dashboard",
      priority: "high",
      createdAt: new Date().toISOString(),
    }
  }

  // Check habit completion
  const todayStr = new Date().toISOString().split("T")[0]
  const completedToday = habitLogs.filter((log: any) => log.date === todayStr && log.completed).length

  if (habits.length > 0 && completedToday === 0 && new Date().getHours() >= 18) {
    return {
      id: "",
      type: "habit-reminder",
      title: "Daily Habits Reminder",
      message: "You haven't completed any habits today. Even small progress counts!",
      actionLabel: "View Habits",
      actionUrl: "/routines",
      priority: "medium",
      createdAt: new Date().toISOString(),
    }
  }

  return null
}

export const habitTemplates: HabitTemplate[] = [
  {
    id: "morning-meditation",
    name: "Morning Meditation",
    description: "Start your day with 10 minutes of mindfulness",
    category: "wellness",
    frequency: "daily",
    icon: "🧘",
  },
  {
    id: "daily-reading",
    name: "Daily Reading",
    description: "Read for 30 minutes every day",
    category: "learning",
    frequency: "daily",
    icon: "📚",
  },
  {
    id: "exercise",
    name: "Exercise",
    description: "Get 30 minutes of physical activity",
    category: "fitness",
    frequency: "daily",
    icon: "💪",
  },
  {
    id: "practice-instrument",
    name: "Practice Instrument",
    description: "Dedicate time to musical practice",
    category: "creative",
    frequency: "daily",
    icon: "🎸",
  },
  {
    id: "journaling",
    name: "Journaling",
    description: "Reflect on your day and thoughts",
    category: "wellness",
    frequency: "daily",
    icon: "📝",
  },
  {
    id: "coding-practice",
    name: "Coding Practice",
    description: "Work on coding skills or projects",
    category: "learning",
    frequency: "daily",
    icon: "💻",
  },
]
