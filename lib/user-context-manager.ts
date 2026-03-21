import type {
  UserProfile,
  UserContext,
  ConversationMemory,
  LearnedFact,
  ProactiveSuggestion,
} from "./types/user-context"

const STORAGE_KEYS = {
  PROFILE: "apex_user_profile",
  CONVERSATIONS: "apex_conversations",
  LEARNED_FACTS: "apex_learned_facts",
  RELATIONSHIPS: "apex_relationships",
  ACTIVITIES: "apex_activities",
}

export class UserContextManager {
  private static instance: UserContextManager

  static getInstance(): UserContextManager {
    if (!UserContextManager.instance) {
      UserContextManager.instance = new UserContextManager()
    }
    return UserContextManager.instance
  }

  // Profile Management
  getUserProfile(): UserProfile | null {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE)
    if (!stored) return null
    return JSON.parse(stored)
  }

  saveUserProfile(profile: UserProfile): void {
    if (typeof window === "undefined") return
    profile.updatedAt = new Date()
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  }

  updateUserProfile(updates: Partial<UserProfile>): void {
    const profile = this.getUserProfile()
    if (!profile) return
    const updated = { ...profile, ...updates, updatedAt: new Date() }
    this.saveUserProfile(updated)
  }

  // Conversation Memory
  saveConversation(conversation: ConversationMemory): void {
    if (typeof window === "undefined") return
    const conversations = this.getConversations()
    conversations.unshift(conversation)

    // Keep only last 100 conversations
    const trimmed = conversations.slice(0, 100)
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(trimmed))

    // Extract and save learned facts
    this.extractAndSaveFacts(conversation)
  }

  getConversations(limit = 20): ConversationMemory[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)
    if (!stored) return []
    const all = JSON.parse(stored)
    return all.slice(0, limit)
  }

  // Learned Facts
  private extractAndSaveFacts(conversation: ConversationMemory): void {
    const { extractedInfo } = conversation

    // Save preferences
    if (extractedInfo.preferences) {
      Object.entries(extractedInfo.preferences).forEach(([key, value]) => {
        this.learnFact({
          id: `pref_${Date.now()}_${Math.random()}`,
          fact: `User prefers ${key}: ${value}`,
          category: "preference",
          confidence: 0.8,
          source: "conversation",
          learnedAt: new Date(),
        })
      })
    }

    // Save facts
    extractedInfo.facts.forEach((fact) => {
      this.learnFact({
        id: `fact_${Date.now()}_${Math.random()}`,
        fact,
        category: "general",
        confidence: 0.7,
        source: "conversation",
        learnedAt: new Date(),
      })
    })
  }

  learnFact(fact: LearnedFact): void {
    if (typeof window === "undefined") return
    const facts = this.getLearnedFacts()

    // Check if similar fact exists
    const existing = facts.find((f) => f.fact.toLowerCase().includes(fact.fact.toLowerCase().substring(0, 20)))

    if (existing) {
      // Update confidence and last confirmed
      existing.confidence = Math.min(1, existing.confidence + 0.1)
      existing.lastConfirmed = new Date()
    } else {
      facts.push(fact)
    }

    localStorage.setItem(STORAGE_KEYS.LEARNED_FACTS, JSON.stringify(facts))
  }

  getLearnedFacts(category?: string): LearnedFact[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEYS.LEARNED_FACTS)
    if (!stored) return []
    const facts = JSON.parse(stored)

    if (category) {
      return facts.filter((f: LearnedFact) => f.category === category)
    }
    return facts
  }

  // Context Retrieval
  getUserContext(): UserContext {
    return {
      profile: this.getUserProfile() || this.getDefaultProfile(),
      recentConversations: this.getConversations(10),
      learnedFacts: this.getLearnedFacts(),
      relationships: this.getRelationships(),
      upcomingEvents: [], // TODO: integrate with calendar
      recentActivities: this.getRecentActivities(),
    }
  }

  getRelevantContext(query: string): string {
    const context = this.getUserContext()
    const profile = context.profile

    // Build context string
    const contextParts: string[] = []

    // User basics
    if (profile.name) {
      contextParts.push(`User's name: ${profile.name}`)
    }

    // Preferences
    contextParts.push(`Communication style: ${profile.preferences.communicationStyle}`)
    contextParts.push(`Focus areas: ${profile.preferences.focusAreas.join(", ")}`)

    // Work style
    contextParts.push(`Preferred work time: ${profile.workStyle.preferredWorkTime}`)

    // Recent facts
    const recentFacts = context.learnedFacts
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map((f) => f.fact)

    if (recentFacts.length > 0) {
      contextParts.push(`Known facts: ${recentFacts.join("; ")}`)
    }

    // Goals
    if (profile.goals.length > 0) {
      const topGoals = profile.goals
        .filter((g) => g.priority === "high")
        .slice(0, 3)
        .map((g) => g.title)
      if (topGoals.length > 0) {
        contextParts.push(`Current goals: ${topGoals.join(", ")}`)
      }
    }

    return contextParts.join("\n")
  }

  // Proactive Suggestions
  generateProactiveSuggestions(): ProactiveSuggestion[] {
    const context = this.getUserContext()
    const suggestions: ProactiveSuggestion[] = []

    // Check for incomplete goals
    context.profile.goals.forEach((goal) => {
      if (goal.progress < 100 && goal.priority === "high") {
        suggestions.push({
          id: `goal_${goal.id}`,
          type: "reminder",
          priority: "high",
          title: `Continue working on: ${goal.title}`,
          description: `You're ${goal.progress}% complete. Keep the momentum going!`,
          action: {
            label: "View Goal",
            handler: "viewGoal",
          },
          reasoning: "High-priority goal with incomplete progress",
          confidence: 0.9,
          createdAt: new Date(),
        })
      }
    })

    // Check for habits
    context.profile.habits.forEach((habit) => {
      const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null
      const now = new Date()

      if (lastCompleted) {
        const hoursSince = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60)

        if (habit.frequency === "daily" && hoursSince > 20) {
          suggestions.push({
            id: `habit_${habit.id}`,
            type: "reminder",
            priority: "medium",
            title: `Time for: ${habit.name}`,
            description: `Keep your ${habit.streak}-day streak alive!`,
            reasoning: "Daily habit not completed today",
            confidence: 0.85,
            createdAt: new Date(),
          })
        }
      }
    })

    // Sort by priority and confidence
    return suggestions.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      const scoreA = priorityWeight[a.priority] * a.confidence
      const scoreB = priorityWeight[b.priority] * b.confidence
      return scoreB - scoreA
    })
  }

  // Helpers
  private getDefaultProfile(): UserProfile {
    return {
      id: `user_${Date.now()}`,
      name: "User",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferences: {
        communicationStyle: "professional",
        notificationFrequency: "medium",
        proactivityLevel: "high",
        focusAreas: ["productivity"],
        workingHours: { start: "09:00", end: "17:00" },
        preferredMeetingTimes: [],
        avoidMeetingTimes: [],
      },
      goals: [],
      habits: [],
      personalInfo: {
        interests: [],
        skills: [],
        learningGoals: [],
        challenges: [],
      },
      workStyle: {
        preferredWorkTime: "morning",
        focusSessionDuration: 90,
        breakFrequency: 25,
        multitaskingPreference: "single-task",
        decisionMakingStyle: "analytical",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  private getRelationships() {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS)
    return stored ? JSON.parse(stored) : []
  }

  private getRecentActivities() {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES)
    return stored ? JSON.parse(stored) : []
  }

  logActivity(activity: any): void {
    if (typeof window === "undefined") return
    const activities = this.getRecentActivities()
    activities.unshift(activity)
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities.slice(0, 50)))
  }
}

export const userContextManager = UserContextManager.getInstance()
