import type { AuraState } from "./types"

export type EmotionalState =
  | "encouraging"
  | "warning"
  | "celebrating"
  | "strategic"
  | "clarifying"
  | "proactive"
  | "empathetic"
  | "urgent"
  | "reflective"
  | "planning"
  | "educational"
  | "confirmatory"
  | "boundary"
  | "motivational"
  | "gratitude"
  | "neutral"
  | "analytical"
  | "celebratory"

export interface VoiceContext {
  state: EmotionalState
  data?: Record<string, any>
  userState?: {
    energy?: number
    budget?: number
    progress?: number
  }
}

export class VoiceGenerator {
  static generate(context: VoiceContext): string {
    const { state, data, userState } = context

    switch (state) {
      case "encouraging":
        return this.generateEncouraging(data, userState)
      case "warning":
        return this.generateWarning(data, userState)
      case "celebrating":
        return this.generateCelebrating(data, userState)
      case "strategic":
        return this.generateStrategic(data, userState)
      case "clarifying":
        return this.generateClarifying(data)
      case "proactive":
        return this.generateProactive(data, userState)
      case "empathetic":
        return this.generateEmpathetic(data, userState)
      case "urgent":
        return this.generateUrgent(data)
      case "reflective":
        return this.generateReflective(data, userState)
      case "planning":
        return this.generatePlanning(data, userState)
      case "educational":
        return this.generateEducational(data)
      case "confirmatory":
        return this.generateConfirmatory(data)
      case "boundary":
        return this.generateBoundary(data, userState)
      case "motivational":
        return this.generateMotivational(data)
      case "gratitude":
        return this.generateGratitude(data)
      case "neutral":
        return "Here's the information you requested."
      case "analytical":
        return "Based on the data available, here are the insights."
      case "celebratory":
        return "Let's celebrate this achievement!"
      default:
        return "I'm here to help. What would you like to do?"
    }
  }

  private static generateEncouraging(data?: Record<string, any>, userState?: any): string {
    const templates = [
      `You're building momentum. ${data?.achievement || "Keep going"}.`,
      `Solid progress on your ${data?.goal || "goal"}. You've improved by ${data?.percent || "significantly"}.`,
      `I see you showing up every day. That discipline is your competitive advantage.`,
      `You're ahead of schedule. Let's keep this energy going.`,
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private static generateWarning(data?: Record<string, any>, userState?: any): string {
    if (data?.type === "lateness") {
      return `Alert: You're ${data.minutes} minutes from being late. Shall I book an Uber for $${data.cost} to get you there on time?`
    }
    if (data?.type === "budget") {
      return `Your ${data.category} spending is ${data.percent}% over budget this week. Let's course-correct before month-end.`
    }
    if (data?.type === "energy") {
      return `Your recovery score is ${data.score}%—lowest this month. Consider rescheduling tomorrow's intense workout.`
    }
    return `Alert: ${data?.message || "Action needed"}. Let's address this now.`
  }

  private static generateCelebrating(data?: Record<string, any>, userState?: any): string {
    return `Victory! ${data?.achievement || "You did it"}. ${data?.impact || "This is what discipline looks like."}`
  }

  private static generateStrategic(data?: Record<string, any>, userState?: any): string {
    return `${data?.insight || "Pattern detected"}: ${data?.detail || "Opportunity identified"}. ${data?.action || "Let's leverage this."}`
  }

  private static generateClarifying(data?: Record<string, any>): string {
    return `I want to help with that. ${data?.question || "Can you provide more details?"}`
  }

  private static generateProactive(data?: Record<string, any>, userState?: any): string {
    return `Heads up: ${data?.observation || "Opportunity detected"}. ${data?.suggestion || "Want to take action?"}`
  }

  private static generateEmpathetic(data?: Record<string, any>, userState?: any): string {
    return `${data?.acknowledgment || "I see you're having a tough time"}. ${data?.support || "Let's focus on one small win today."}`
  }

  private static generateUrgent(data?: Record<string, any>): string {
    return `Critical: ${data?.situation || "Time-sensitive action needed"}. ${data?.action || "Act now."}`
  }

  private static generateReflective(data?: Record<string, any>, userState?: any): string {
    return `${data?.period || "This week"}: ${data?.summary || "You're executing your plan"}. ${data?.assessment || "Keep going."}`
  }

  private static generatePlanning(data?: Record<string, any>, userState?: any): string {
    return `Let's ${data?.action || "design your optimal week"}. ${data?.context || "You have resources available"}. ${data?.question || "Where should they go?"}`
  }

  private static generateEducational(data?: Record<string, any>): string {
    return `Here's why: ${data?.explanation || "Understanding this helps you make better decisions"}.`
  }

  private static generateConfirmatory(data?: Record<string, any>): string {
    return `Done. ${data?.confirmation || "Action completed"}. ${data?.details || ""}`
  }

  private static generateBoundary(data?: Record<string, any>, userState?: any): string {
    return `${data?.conflict || "This conflicts with your priorities"}. ${data?.question || "Is that the trade-off you want?"}`
  }

  private static generateMotivational(data?: Record<string, any>): string {
    return `${data?.push || "You've been thinking about this long enough"}. ${data?.action || "Let's just start and see what happens."}`
  }

  private static generateGratitude(data?: Record<string, any>): string {
    return `${data?.thanks || "Thank you for that feedback"}. ${data?.commitment || "I'm learning to serve you better."}`
  }

  static speak(
    text: string,
    auraState: AuraState,
    emotionalState: EmotionalState = "neutral",
    onStart?: () => void,
    onEnd?: () => void,
  ): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Adapt voice parameters based on AuraState
    const voiceParams = this.getVoiceParameters(auraState, emotionalState)
    utterance.rate = voiceParams.rate
    utterance.pitch = voiceParams.pitch
    utterance.volume = voiceParams.volume

    // Set callbacks
    if (onStart) utterance.onstart = onStart
    if (onEnd) utterance.onend = onEnd

    window.speechSynthesis.speak(utterance)
  }

  private static getVoiceParameters(
    auraState: AuraState,
    emotionalState: EmotionalState,
  ): { rate: number; pitch: number; volume: number } {
    // Base parameters
    let rate = 0.95
    let pitch = 1.0
    let volume = 0.8

    // Adjust based on AuraState
    switch (auraState) {
      case "Stressed":
        rate = 0.85 // Slower, calmer
        pitch = 0.95 // Lower, more soothing
        volume = 0.7 // Softer
        break
      case "Energized":
        rate = 1.05 // Faster, more dynamic
        pitch = 1.1 // Higher, more enthusiastic
        volume = 0.85 // Slightly louder
        break
      case "Tired":
        rate = 0.9 // Slower
        pitch = 0.98 // Slightly lower
        volume = 0.75 // Softer
        break
      case "Focused":
        rate = 0.95 // Steady pace
        pitch = 1.0 // Neutral
        volume = 0.8 // Normal
        break
      case "Creative":
        rate = 1.0 // Normal pace
        pitch = 1.05 // Slightly higher, more engaging
        volume = 0.8 // Normal
        break
      case "Neutral":
      default:
        // Use base parameters
        break
    }

    // Further adjust based on EmotionalState
    switch (emotionalState) {
      case "warning":
      case "urgent":
        if (auraState === "Stressed") {
          // Empathetic and reassuring for stressed users
          rate = 0.85
          pitch = 0.95
        } else {
          // More alert for non-stressed users
          rate = 1.0
          pitch = 1.05
        }
        break
      case "motivational":
      case "celebrating":
      case "celebratory":
        if (auraState === "Energized") {
          // High energy and enthusiasm
          rate = 1.1
          pitch = 1.15
          volume = 0.9
        } else {
          // Encouraging but not overwhelming
          rate = 1.0
          pitch = 1.08
        }
        break
      case "empathetic":
        rate = 0.85
        pitch = 0.95
        volume = 0.75
        break
      case "analytical":
      case "strategic":
        rate = 0.95
        pitch = 1.0
        break
      case "reflective":
        rate = 0.9
        pitch = 0.98
        break
    }

    return { rate, pitch, volume }
  }
}
