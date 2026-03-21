import { openDB, type IDBPDatabase } from "idb"
import type { PersonalityProfile, PersonalityContext, PersonalityFeedback, PersonalityStats } from "./types/personality"
import { PERSONALITY_PROFILES, getPersonalityProfile } from "./personality-profiles"

const DB_NAME = "apex-personality"
const FEEDBACK_STORE = "feedback"
const SETTINGS_STORE = "settings"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize the personality database
 */
async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FEEDBACK_STORE)) {
        const store = db.createObjectStore(FEEDBACK_STORE, { autoIncrement: true })
        store.createIndex("profileId", "profileId")
        store.createIndex("timestamp", "timestamp")
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE)
      }
    },
  })

  return dbInstance
}

/**
 * Get current context
 */
function getCurrentContext(): PersonalityContext {
  const now = new Date()
  const hour = now.getHours()

  let timeOfDay: "morning" | "afternoon" | "evening" | "night"
  if (hour >= 5 && hour < 12) timeOfDay = "morning"
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon"
  else if (hour >= 17 && hour < 21) timeOfDay = "evening"
  else timeOfDay = "night"

  return {
    timeOfDay,
    userMood: "neutral",
  }
}

/**
 * Adapt personality based on context
 */
export function adaptPersonality(profile: PersonalityProfile, context: PersonalityContext): PersonalityProfile {
  let adapted = { ...profile }

  // Apply time-based adaptations
  const timeAdaptation = profile.contextualAdaptations[context.timeOfDay]
  if (timeAdaptation) {
    adapted = { ...adapted, ...timeAdaptation }
  }

  // Apply mood-based adaptations
  if (context.userMood && profile.contextualAdaptations[context.userMood]) {
    const moodAdaptation = profile.contextualAdaptations[context.userMood]
    adapted = { ...adapted, ...moodAdaptation }
  }

  // Apply user preferences
  if (context.userPreferences) {
    if (context.userPreferences.preferredTone) {
      adapted.emotionalTone = context.userPreferences.preferredTone
    }
    if (context.userPreferences.preferredStyle) {
      adapted.communicationStyle = context.userPreferences.preferredStyle
    }
  }

  return adapted
}

/**
 * Get active personality profile with context adaptation
 */
export async function getActivePersonality(context?: PersonalityContext): Promise<PersonalityProfile> {
  const db = await getDB()
  const settings = await db.get(SETTINGS_STORE, "active_profile")

  const profileId = settings || "supportive"
  const profile = getPersonalityProfile(profileId)

  if (!profile) {
    return PERSONALITY_PROFILES.supportive
  }

  const currentContext = context || getCurrentContext()
  return adaptPersonality(profile, currentContext)
}

/**
 * Set active personality profile
 */
export async function setActivePersonality(profileId: string): Promise<void> {
  const db = await getDB()
  await db.put(SETTINGS_STORE, profileId, "active_profile")
  console.log("[v0] Set active personality:", profileId)
}

/**
 * Record personality feedback
 */
export async function recordPersonalityFeedback(feedback: Omit<PersonalityFeedback, "timestamp">): Promise<void> {
  const db = await getDB()

  const fullFeedback: PersonalityFeedback = {
    ...feedback,
    timestamp: new Date().toISOString(),
  }

  await db.add(FEEDBACK_STORE, fullFeedback)
  console.log("[v0] Recorded personality feedback:", feedback.profileId, feedback.wasHelpful)
}

/**
 * Get personality statistics
 */
export async function getPersonalityStats(): Promise<PersonalityStats> {
  const db = await getDB()
  const feedbacks = await db.getAll(FEEDBACK_STORE)
  const settings = await db.get(SETTINGS_STORE, "active_profile")

  const currentProfile = settings || "supportive"
  const totalInteractions = feedbacks.length

  const helpfulCount = feedbacks.filter((f) => f.wasHelpful).length
  const feedbackScore = totalInteractions > 0 ? helpfulCount / totalInteractions : 0

  // Count trait preferences based on feedback
  const traitCounts: Record<string, number> = {}
  feedbacks.forEach((f) => {
    if (f.wasHelpful) {
      const profile = getPersonalityProfile(f.profileId)
      if (profile) {
        profile.traits.forEach((trait) => {
          traitCounts[trait] = (traitCounts[trait] || 0) + 1
        })
      }
    }
  })

  const preferredTraits = Object.entries(traitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([trait]) => trait as any)

  return {
    currentProfile,
    totalInteractions,
    feedbackScore,
    preferredTraits,
    adaptationHistory: [],
  }
}

/**
 * Get recommended personality based on feedback
 */
export async function getRecommendedPersonality(): Promise<string> {
  const stats = await getPersonalityStats()

  if (stats.totalInteractions < 10) {
    return stats.currentProfile
  }

  // If current profile has good feedback, keep it
  if (stats.feedbackScore > 0.7) {
    return stats.currentProfile
  }

  // Find profile that matches preferred traits
  const profiles = Object.values(PERSONALITY_PROFILES)
  let bestMatch = stats.currentProfile
  let bestScore = 0

  for (const profile of profiles) {
    const matchScore = profile.traits.filter((trait) => stats.preferredTraits.includes(trait)).length
    if (matchScore > bestScore) {
      bestScore = matchScore
      bestMatch = profile.id
    }
  }

  return bestMatch
}

/**
 * Clear personality data
 */
export async function clearPersonalityData(): Promise<void> {
  const db = await getDB()
  await db.clear(FEEDBACK_STORE)
  await db.clear(SETTINGS_STORE)
  console.log("[v0] Cleared personality data")
}
