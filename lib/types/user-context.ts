export interface UserProfile {
  id: string
  name: string
  email?: string
  timezone: string
  preferences: UserPreferences
  goals: Goal[]
  habits: Habit[]
  personalInfo: PersonalInfo
  workStyle: WorkStyle
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  communicationStyle: "concise" | "detailed" | "casual" | "professional"
  tone?: "motivational" | "supportive" | "chill" | "professional"
  notificationFrequency: "high" | "medium" | "low"
  proactivityLevel: "high" | "medium" | "low"
  focusAreas: string[] // e.g., ['productivity', 'finance', 'health']
  schedulePreference?: "daily-checkins" | "on-demand" | "not-sure"
  workingHours: {
    start: string // e.g., "09:00"
    end: string // e.g., "17:00"
  }
  preferredMeetingTimes: string[]
  avoidMeetingTimes: string[]
}

export interface Goal {
  id: string
  title: string
  description: string
  category: "career" | "finance" | "health" | "personal" | "learning"
  priority: "high" | "medium" | "low"
  deadline?: Date
  progress: number // 0-100
  milestones: Milestone[]
  createdAt: Date
  updatedAt: Date
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  completedAt?: Date
}

export interface Habit {
  id: string
  name: string
  frequency: "daily" | "weekly" | "monthly"
  timeOfDay?: "morning" | "afternoon" | "evening"
  streak: number
  lastCompleted?: Date
  category: string
}

export interface PersonalInfo {
  occupation?: string
  industry?: string
  company?: string
  interests: string[]
  skills: string[]
  learningGoals: string[]
  challenges: string[]
}

export interface WorkStyle {
  preferredWorkTime: "morning" | "afternoon" | "evening" | "night"
  focusSessionDuration: number // minutes
  breakFrequency: number // minutes
  multitaskingPreference: "single-task" | "multi-task"
  decisionMakingStyle: "analytical" | "intuitive" | "collaborative"
}

export interface ConversationMemory {
  id: string
  timestamp: Date
  userMessage: string
  assistantResponse: string
  context: string[]
  extractedInfo: ExtractedInfo
  sentiment: "positive" | "neutral" | "negative"
}

export interface ExtractedInfo {
  entities: string[] // people, places, things mentioned
  topics: string[]
  actionItems: string[]
  preferences: Record<string, any>
  facts: string[]
}

export interface UserContext {
  profile: UserProfile
  recentConversations: ConversationMemory[]
  learnedFacts: LearnedFact[]
  relationships: Relationship[]
  upcomingEvents: any[] // from calendar
  recentActivities: Activity[]
}

export interface LearnedFact {
  id: string
  fact: string
  category: string
  confidence: number // 0-1
  source: "conversation" | "calendar" | "financial" | "routine"
  learnedAt: Date
  lastConfirmed?: Date
}

export interface Relationship {
  id: string
  name: string
  type: "family" | "friend" | "colleague" | "client" | "other"
  importance: "high" | "medium" | "low"
  notes: string[]
  lastInteraction?: Date
}

export interface Activity {
  id: string
  type: "chat" | "calendar" | "financial" | "routine" | "task"
  description: string
  timestamp: Date
  metadata: Record<string, any>
}

export interface ProactiveSuggestion {
  id: string
  type: "reminder" | "insight" | "recommendation" | "warning" | "opportunity"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  action?: {
    label: string
    handler: string // function name or route
  }
  reasoning: string
  confidence: number // 0-1
  createdAt: Date
  dismissed?: boolean
}
