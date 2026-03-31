export interface RegretUnit {
  id: string
  timestamp: string
  decision: string
  context: {
    domain: "career" | "financial" | "health" | "social" | "time" | "personal"
    urgency: "immediate" | "short-term" | "long-term"
    reversibility: "irreversible" | "difficult" | "moderate" | "easy"
  }
  ruScore: number // 0-100, higher = more regret potential
  ruBreakdown: {
    opportunityCost: number // 0-100
    emotionalImpact: number // 0-100
    compoundingEffect: number // 0-100
    alignmentGap: number // 0-100
    timeHorizon: number // 0-100
  }
  alternativePaths: Array<{
    id: string
    description: string
    projectedRU: number
    probability: number
    timeline: string
  }>
  mitigationStrategies: string[]
  status: "pending" | "accepted" | "mitigated" | "regretted"
}

export interface RegretProfile {
  userId: string
  totalRUSaved: number
  totalRUSpent: number
  netRU: number
  regretPatterns: Array<{
    domain: string
    frequency: number
    avgRU: number
    commonTriggers: string[]
  }>
  riskTolerance: {
    career: number // 0-1
    financial: number
    health: number
    social: number
    time: number
  }
  historicalDecisions: RegretUnit[]
}

export interface PreCognitionTrigger {
  id: string
  timestamp: string
  triggerType: "unspoken-desire" | "pattern-break" | "opportunity-window" | "risk-spike"
  confidence: number // 0-1
  signal: string
  suggestedAction: string
  ruImpact: number
  autonomousActionAvailable: boolean
}
