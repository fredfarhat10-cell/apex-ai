/**
 * CrewAI Backend Client
 * Connects Next.js frontend to Python CrewAI backend
 */

const CREWAI_BASE_URL = process.env.CREWAI_API_URL || "http://localhost:8000"

export interface UserContext {
  wellnessData?: {
    today?: any
    recent?: any[]
    briefing?: any
    summary?: {
      recovery?: number | null
      hrv?: number | null
      rhr?: number | null
      sleepDuration?: number | null
      sleepEfficiency?: number | null
      strain?: number | null
    }
  }
  financialData?: {
    accounts?: any[]
    transactions?: any[]
    velocity?: any
    summary?: {
      totalNetWorth?: number
      monthlyChange?: number
      monthlyChangePercent?: number
    }
  }
  calendarData?: any[]
  notionData?: any[]
}

export class CrewAIClient {
  private baseUrl: string

  constructor(baseUrl: string = CREWAI_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`CrewAI API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] CrewAI request failed:", error)
      throw error
    }
  }

  async generateAlphaBrief(userId: string, ticker: string) {
    return this.request("/api/generate-brief", { userId, ticker })
  }

  async generateDailyPath(userId: string) {
    return this.request("/api/daily-path", { userId })
  }

  async facilitateMentorship(userId: string, questId: string) {
    return this.request("/api/mentorship", { userId, questId })
  }

  async planTravel(
    userId: string,
    destination: string,
    budget: number,
    dates: { start: string; end: string },
    preferences: string[],
  ) {
    return this.request("/api/travel/plan", {
      userId,
      destination,
      budget,
      dates,
      preferences,
    })
  }

  async conductCareerReview(userId: string) {
    return this.request("/api/career/review", { userId })
  }

  async conductWeeklySync(userId: string, userContext: UserContext) {
    return this.request("/api/weekly-sync", { userId, ...userContext })
  }

  async executeVoiceCommand(userId: string, command: string, intent: string, entities: Record<string, any>) {
    return this.request("/api/voice-command", {
      userId,
      command,
      intent,
      entities,
    })
  }

  async checkLogistics(userId: string, eventId: string) {
    return this.request("/api/logistics/check", { userId, eventId })
  }

  async processMemory(params: {
    userId: string
    interactionType: string
    feedback?: "positive" | "negative"
    context?: Record<string, any>
  }) {
    return this.request("/api/memory/process", params)
  }

  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`)
    return response.json()
  }

  async simulateLifeDecision(userId: string, decision: string, userContext: UserContext) {
    return this.request("/api/simulate-decision", { userId, decision, ...userContext })
  }
}

// Singleton instance
export const crewAIClient = new CrewAIClient()
