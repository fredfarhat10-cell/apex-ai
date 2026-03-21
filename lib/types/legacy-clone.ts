export interface PerformanceDNA {
  id: string
  userId: string
  createdAt: Date
  metadata: {
    name: string
    description: string
    visibility: "private" | "public" | "unlisted"
    tags: string[]
  }

  // Core Performance Metrics
  metrics: {
    financialVelocity: number
    wellnessScore: number
    productivityIndex: number
    socialCapital: number
    learningRate: number
    emotionalStability: number
  }

  // Behavioral Patterns
  patterns: {
    decisionSpeed: number // ms average
    riskTolerance: number // 0-100
    optimizationStyle: "aggressive" | "balanced" | "conservative"
    focusAreas: string[]
    peakPerformanceHours: number[]
    recoveryPatterns: string[]
  }

  // Habit DNA
  habits: {
    name: string
    frequency: number // times per week
    consistency: number // 0-100
    impact: number // RU saved
    category: string
  }[]

  // Decision DNA
  decisions: {
    category: string
    avgRegretScore: number
    successRate: number
    avgResponseTime: number
    topStrategies: string[]
  }[]

  // Archetype Profile
  archetype: {
    primary: string
    secondary: string
    traits: Record<string, number>
    evolutionPath: string[]
  }

  // Regret Profile
  regretProfile: {
    totalRUSaved: number
    totalRUSpent: number
    netRU: number
    topRegretCategories: string[]
    mitigationStrategies: string[]
  }

  // Shareable Insights
  insights: {
    title: string
    description: string
    impact: string
    category: string
  }[]
}

export interface LegacyCloneShare {
  cloneId: string
  shareUrl: string
  accessCode?: string
  expiresAt?: Date
  viewCount: number
  clonedCount: number
}

export interface CloneComparison {
  userDNA: PerformanceDNA
  cloneDNA: PerformanceDNA
  differences: {
    metric: string
    userValue: number
    cloneValue: number
    delta: number
    recommendation: string
  }[]
  compatibilityScore: number
  adoptablePatterns: string[]
}
