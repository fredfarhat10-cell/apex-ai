export type PersonalityTrait =
  | "motivational"
  | "supportive"
  | "professional"
  | "casual"
  | "analytical"
  | "creative"
  | "empathetic"
  | "direct"

export type CommunicationStyle = "formal" | "casual" | "friendly" | "concise" | "detailed"

export type EmotionalTone = "enthusiastic" | "calm" | "serious" | "playful" | "neutral"

export interface PersonalityProfile {
  id: string
  name: string
  description: string
  traits: PersonalityTrait[]
  communicationStyle: CommunicationStyle
  emotionalTone: EmotionalTone
  systemPrompt: string
  contextualAdaptations: {
    morning?: Partial<PersonalityProfile>
    afternoon?: Partial<PersonalityProfile>
    evening?: Partial<PersonalityProfile>
    stressed?: Partial<PersonalityProfile>
    relaxed?: Partial<PersonalityProfile>
  }
}

export interface PersonalityContext {
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
  userMood?: "happy" | "sad" | "stressed" | "relaxed" | "neutral"
  recentActivity?: string
  userPreferences?: {
    preferredTone?: EmotionalTone
    preferredStyle?: CommunicationStyle
  }
}

export interface PersonalityFeedback {
  profileId: string
  context: PersonalityContext
  wasHelpful: boolean
  timestamp: string
  reason?: string
}

export interface PersonalityStats {
  currentProfile: string
  totalInteractions: number
  feedbackScore: number
  preferredTraits: PersonalityTrait[]
  adaptationHistory: Array<{
    from: string
    to: string
    reason: string
    timestamp: string
  }>
}
