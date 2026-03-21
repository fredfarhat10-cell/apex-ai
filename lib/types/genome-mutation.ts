export type LifeArchetype =
  | "Optimizer"
  | "Explorer"
  | "Builder"
  | "Healer"
  | "Connector"
  | "Scholar"
  | "Maverick"
  | "Guardian"

export interface LifeGenome {
  userId: string
  currentArchetype: LifeArchetype
  archetypeDistribution: Record<LifeArchetype, number> // 0-100 percentage
  dominantTraits: string[]
  evolutionHistory: Array<{
    timestamp: string
    archetype: LifeArchetype
    trigger: string
  }>
}

export interface ParallelLife {
  id: string
  archetype: LifeArchetype
  divergencePoint: {
    timestamp: string
    decision: string
    description: string
  }
  projectedOutcomes: {
    career: {
      role: string
      satisfaction: number // 0-100
      income: number
      growth: number // 0-100
    }
    financial: {
      netWorth: number
      stability: number // 0-100
      freedom: number // 0-100
    }
    wellness: {
      health: number // 0-100
      energy: number // 0-100
      longevity: number // years
    }
    relationships: {
      depth: number // 0-100
      breadth: number // number of connections
      satisfaction: number // 0-100
    }
    fulfillment: {
      purpose: number // 0-100
      impact: number // 0-100
      legacy: number // 0-100
    }
  }
  probability: number // 0-1, likelihood of this path
  timeHorizon: string // "1 year", "5 years", "10 years"
  keyMilestones: Array<{
    year: number
    event: string
    impact: string
  }>
}

export interface GenomeMutation {
  id: string
  timestamp: string
  mutationType: "decision" | "habit" | "relationship" | "career" | "location"
  description: string
  currentPath: ParallelLife
  alternativePaths: ParallelLife[]
  recommendedPath: string // ID of recommended parallel life
  reasoning: string
}
