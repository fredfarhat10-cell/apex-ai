import { openDB, type IDBPDatabase } from "idb"
import type { Suggestion, SuggestionPattern, SuggestionStats } from "./types/suggestion"
import { searchMemories } from "./vector-memory"

const DB_NAME = "apex-suggestions"
const SUGGESTIONS_STORE = "suggestions"
const PATTERNS_STORE = "patterns"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize the suggestions database
 */
async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SUGGESTIONS_STORE)) {
        const store = db.createObjectStore(SUGGESTIONS_STORE, { keyPath: "id" })
        store.createIndex("createdAt", "metadata.createdAt")
        store.createIndex("category", "category")
        store.createIndex("priority", "priority")
      }
      if (!db.objectStoreNames.contains(PATTERNS_STORE)) {
        const store = db.createObjectStore(PATTERNS_STORE, { keyPath: "id" })
        store.createIndex("successRate", "successRate")
        store.createIndex("enabled", "enabled")
      }
    },
  })

  return dbInstance
}

/**
 * Get current context for suggestion generation
 */
function getCurrentContext() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" })

  let timeOfDay: "morning" | "afternoon" | "evening" | "night"
  if (hour >= 5 && hour < 12) timeOfDay = "morning"
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon"
  else if (hour >= 17 && hour < 21) timeOfDay = "evening"
  else timeOfDay = "night"

  return {
    timeOfDay,
    dayOfWeek,
    hour,
    timestamp: now.toISOString(),
  }
}

/**
 * Generate suggestions based on context and patterns
 */
export async function generateSuggestions(userContext?: {
  mood?: string
  recentActivity?: string
  goals?: string[]
}): Promise<Suggestion[]> {
  const db = await getDB()
  const context = getCurrentContext()
  const suggestions: Suggestion[] = []

  // Get enabled patterns
  const patterns = await db.getAllFromIndex(PATTERNS_STORE, "enabled", IDBKeyRange.only(true))

  // Time-based suggestions
  if (context.timeOfDay === "morning") {
    suggestions.push({
      id: `sug_${Date.now()}_morning`,
      type: "action",
      title: "Start Your Day Right",
      description: "Review your goals and plan your day",
      priority: "high",
      category: "productivity",
      context: { timeOfDay: context.timeOfDay, dayOfWeek: context.dayOfWeek },
      actionable: true,
      action: { type: "navigate", payload: { route: "/goals" } },
      metadata: {
        createdAt: context.timestamp,
        source: "pattern",
        confidence: 0.85,
      },
    })
  }

  if (context.timeOfDay === "evening") {
    suggestions.push({
      id: `sug_${Date.now()}_evening`,
      type: "reminder",
      title: "Reflect on Your Day",
      description: "Take a moment to review what you accomplished today",
      priority: "medium",
      category: "wellness",
      context: { timeOfDay: context.timeOfDay, dayOfWeek: context.dayOfWeek },
      actionable: true,
      action: { type: "navigate", payload: { route: "/journal" } },
      metadata: {
        createdAt: context.timestamp,
        source: "pattern",
        confidence: 0.8,
      },
    })
  }

  // Pattern-based suggestions
  for (const pattern of patterns) {
    if (pattern.successRate > 0.6 && pattern.timesShown < 100) {
      const suggestion: Suggestion = {
        id: `sug_${Date.now()}_${pattern.id}`,
        ...pattern.suggestionTemplate,
        context: { ...context, ...pattern.suggestionTemplate.context },
        metadata: {
          createdAt: context.timestamp,
          source: "pattern",
          confidence: pattern.successRate,
        },
      } as Suggestion

      suggestions.push(suggestion)
    }
  }

  // AI-generated suggestions using vector memory
  try {
    const recentMemories = await searchMemories("recent activities goals", 5, 0.5)
    if (recentMemories.length > 0) {
      const memoryContext = recentMemories.map((m) => m.memory.content).join(". ")

      suggestions.push({
        id: `sug_${Date.now()}_ai`,
        type: "insight",
        title: "Based on Your Recent Activity",
        description: `You might want to focus on: ${memoryContext.slice(0, 100)}...`,
        priority: "medium",
        category: "personalized",
        context: { ...context, recentActivity: memoryContext },
        actionable: false,
        metadata: {
          createdAt: context.timestamp,
          source: "ai",
          confidence: 0.75,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Failed to generate AI suggestions:", error)
  }

  // Store suggestions
  for (const suggestion of suggestions) {
    await db.put(SUGGESTIONS_STORE, suggestion)
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

/**
 * Record feedback on a suggestion
 */
export async function recordFeedback(suggestionId: string, accepted: boolean, reason?: string): Promise<void> {
  const db = await getDB()
  const suggestion = await db.get(SUGGESTIONS_STORE, suggestionId)

  if (!suggestion) {
    console.error("[v0] Suggestion not found:", suggestionId)
    return
  }

  // Update suggestion with feedback
  suggestion.feedback = {
    accepted,
    timestamp: new Date().toISOString(),
    reason,
  }

  await db.put(SUGGESTIONS_STORE, suggestion)

  // Update pattern success rate if suggestion came from a pattern
  if (suggestion.metadata.source === "pattern") {
    await updatePatternSuccessRate(suggestion.category, accepted)
  }

  console.log("[v0] Recorded feedback for suggestion:", suggestionId, accepted ? "accepted" : "rejected")
}

/**
 * Update pattern success rate based on feedback
 */
async function updatePatternSuccessRate(category: string, accepted: boolean): Promise<void> {
  const db = await getDB()
  const patterns = await db.getAll(PATTERNS_STORE)

  for (const pattern of patterns) {
    if (pattern.suggestionTemplate.category === category) {
      pattern.timesShown++
      if (accepted) {
        pattern.timesAccepted++
      }
      pattern.successRate = pattern.timesAccepted / pattern.timesShown
      pattern.lastShown = new Date().toISOString()

      await db.put(PATTERNS_STORE, pattern)
    }
  }
}

/**
 * Get all suggestions
 */
export async function getAllSuggestions(): Promise<Suggestion[]> {
  const db = await getDB()
  return db.getAll(SUGGESTIONS_STORE)
}

/**
 * Get active suggestions (not expired, no feedback)
 */
export async function getActiveSuggestions(): Promise<Suggestion[]> {
  const suggestions = await getAllSuggestions()
  const now = new Date()

  return suggestions.filter((s) => {
    if (s.feedback) return false
    if (s.metadata.expiresAt && new Date(s.metadata.expiresAt) < now) return false
    return true
  })
}

/**
 * Get suggestion statistics
 */
export async function getSuggestionStats(): Promise<SuggestionStats> {
  const suggestions = await getAllSuggestions()

  const totalGenerated = suggestions.length
  const totalAccepted = suggestions.filter((s) => s.feedback?.accepted).length
  const totalRejected = suggestions.filter((s) => s.feedback && !s.feedback.accepted).length
  const acceptanceRate = totalGenerated > 0 ? totalAccepted / totalGenerated : 0

  const categoryStats: Record<string, { count: number; accepted: number }> = {}
  suggestions.forEach((s) => {
    if (!categoryStats[s.category]) {
      categoryStats[s.category] = { count: 0, accepted: 0 }
    }
    categoryStats[s.category].count++
    if (s.feedback?.accepted) {
      categoryStats[s.category].accepted++
    }
  })

  const topCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      count: stats.count,
      acceptanceRate: stats.count > 0 ? stats.accepted / stats.count : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const recentSuggestions = suggestions
    .sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime())
    .slice(0, 10)

  return {
    totalGenerated,
    totalAccepted,
    totalRejected,
    acceptanceRate,
    topCategories,
    topPatterns: [],
    recentSuggestions,
  }
}

/**
 * Create a new suggestion pattern
 */
export async function createPattern(pattern: Omit<SuggestionPattern, "id">): Promise<SuggestionPattern> {
  const db = await getDB()

  const newPattern: SuggestionPattern = {
    id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...pattern,
  }

  await db.put(PATTERNS_STORE, newPattern)
  console.log("[v0] Created suggestion pattern:", newPattern.id)

  return newPattern
}

/**
 * Clear old suggestions
 */
export async function clearOldSuggestions(daysOld = 30): Promise<number> {
  const db = await getDB()
  const suggestions = await getAllSuggestions()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  let deleted = 0
  for (const suggestion of suggestions) {
    if (new Date(suggestion.metadata.createdAt) < cutoffDate) {
      await db.delete(SUGGESTIONS_STORE, suggestion.id)
      deleted++
    }
  }

  console.log("[v0] Cleared", deleted, "old suggestions")
  return deleted
}
