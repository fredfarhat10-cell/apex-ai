// Financial Goals and Investment Types

export interface FinancialGoal {
  id: string
  userId: string
  name: string
  type: "retirement" | "home" | "education" | "emergency" | "vacation" | "custom"
  targetAmount: number
  currentAmount: number
  targetDate: string
  monthlyContribution: number
  riskTolerance: "conservative" | "moderate" | "aggressive"
  priority: "high" | "medium" | "low"
  status: "on-track" | "behind" | "ahead" | "completed"
  createdAt: string
  updatedAt: string
}

export interface GoalProjection {
  goalId: string
  projectedAmount: number
  projectedDate: string
  monthlyContributionNeeded: number
  probabilityOfSuccess: number
  recommendedAdjustments: string[]
}

export interface PortfolioAllocation {
  goalId: string
  stocks: number // percentage
  bonds: number // percentage
  cash: number // percentage
  alternatives: number // percentage
  expectedReturn: number // annual percentage
  volatility: number // standard deviation
}

export interface GoalScenario {
  id: string
  goalId: string
  name: string
  description: string
  adjustments: {
    monthlyContribution?: number
    targetDate?: string
    targetAmount?: number
    riskTolerance?: "conservative" | "moderate" | "aggressive"
  }
  projectedOutcome: {
    finalAmount: number
    successProbability: number
    timeToGoal: number
  }
  createdAt: string
}

export interface GoalMilestone {
  id: string
  goalId: string
  amount: number
  date: string
  description: string
  achieved: boolean
  achievedDate?: string
}
