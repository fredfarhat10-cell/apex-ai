export interface Suggestion {
  id: string
  type: "action" | "reminder" | "insight" | "recommendation" | "question"
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  context: {
    timeOfDay?: "morning" | "afternoon" | "evening" | "night"
    dayOfWeek?: string
    userMood?: string
    recentActivity?: string
    location?: string
  }
  actionable: boolean
  action?: {
    type: "navigate" | "schedule" | "remind" | "execute"
    payload: any
  }
  metadata: {
    createdAt: string
    expiresAt?: string
    source: "ai" | "pattern" | "scheduled" | "manual"
    confidence: number
  }
  feedback?: {
    accepted: boolean
    timestamp: string
    reason?: string
  }
}

export interface SuggestionPattern {
  id: string
  trigger: {
    timePattern?: string
    contextPattern?: string
    eventPattern?: string
  }
  suggestionTemplate: Partial<Suggestion>
  successRate: number
  timesShown: number
  timesAccepted: number
  lastShown?: string
  enabled: boolean
}

export interface SuggestionStats {
  totalGenerated: number
  totalAccepted: number
  totalRejected: number
  acceptanceRate: number
  topCategories: Array<{ category: string; count: number; acceptanceRate: number }>
  topPatterns: Array<{ pattern: string; successRate: number }>
  recentSuggestions: Suggestion[]
}
