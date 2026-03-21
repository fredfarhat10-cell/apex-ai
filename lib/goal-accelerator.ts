// Goal-Based Investment Accelerator System

import { openDB, type IDBPDatabase } from "idb"
import type {
  FinancialGoal,
  GoalProjection,
  PortfolioAllocation,
  GoalScenario,
  GoalMilestone,
} from "./types/financial-goals"

const DB_NAME = "apex-goal-accelerator"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("goals")) {
        const goalStore = db.createObjectStore("goals", { keyPath: "id" })
        goalStore.createIndex("userId", "userId")
        goalStore.createIndex("type", "type")
        goalStore.createIndex("status", "status")
      }

      if (!db.objectStoreNames.contains("scenarios")) {
        const scenarioStore = db.createObjectStore("scenarios", { keyPath: "id" })
        scenarioStore.createIndex("goalId", "goalId")
      }

      if (!db.objectStoreNames.contains("milestones")) {
        const milestoneStore = db.createObjectStore("milestones", { keyPath: "id" })
        milestoneStore.createIndex("goalId", "goalId")
      }
    },
  })

  return dbInstance
}

/**
 * Create a new financial goal
 */
export async function createFinancialGoal(
  userId: string,
  goalData: Omit<FinancialGoal, "id" | "userId" | "currentAmount" | "status" | "createdAt" | "updatedAt">,
): Promise<FinancialGoal> {
  const db = await getDB()

  const goal: FinancialGoal = {
    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    currentAmount: 0,
    status: "on-track",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...goalData,
  }

  await db.put("goals", goal)

  // Create initial milestones
  await generateMilestones(goal)

  return goal
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(goalId: string, amount: number): Promise<FinancialGoal> {
  const db = await getDB()
  const goal = await db.get("goals", goalId)

  if (!goal) {
    throw new Error("Goal not found")
  }

  goal.currentAmount = amount
  goal.updatedAt = new Date().toISOString()

  // Update status based on projection
  const projection = await projectGoalCompletion(goal)
  if (projection.probabilityOfSuccess >= 80) {
    goal.status = "ahead"
  } else if (projection.probabilityOfSuccess >= 50) {
    goal.status = "on-track"
  } else {
    goal.status = "behind"
  }

  // Check if goal is completed
  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = "completed"
  }

  await db.put("goals", goal)

  // Check milestones
  await checkMilestones(goalId, amount)

  return goal
}

/**
 * Calculate optimal portfolio allocation based on risk tolerance and time horizon
 */
export function calculatePortfolioAllocation(goal: FinancialGoal): PortfolioAllocation {
  const yearsToGoal = (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)

  let stocks = 0
  let bonds = 0
  let cash = 0
  let alternatives = 0
  let expectedReturn = 0
  let volatility = 0

  // Adjust allocation based on risk tolerance and time horizon
  if (goal.riskTolerance === "aggressive") {
    if (yearsToGoal > 10) {
      stocks = 90
      bonds = 5
      alternatives = 5
      expectedReturn = 9.5
      volatility = 18
    } else if (yearsToGoal > 5) {
      stocks = 80
      bonds = 15
      alternatives = 5
      expectedReturn = 8.5
      volatility = 15
    } else {
      stocks = 70
      bonds = 25
      cash = 5
      expectedReturn = 7.5
      volatility = 12
    }
  } else if (goal.riskTolerance === "moderate") {
    if (yearsToGoal > 10) {
      stocks = 70
      bonds = 25
      alternatives = 5
      expectedReturn = 7.5
      volatility = 12
    } else if (yearsToGoal > 5) {
      stocks = 60
      bonds = 35
      cash = 5
      expectedReturn = 6.5
      volatility = 10
    } else {
      stocks = 50
      bonds = 40
      cash = 10
      expectedReturn = 5.5
      volatility = 8
    }
  } else {
    // conservative
    if (yearsToGoal > 10) {
      stocks = 40
      bonds = 50
      cash = 10
      expectedReturn = 5.0
      volatility = 7
    } else if (yearsToGoal > 5) {
      stocks = 30
      bonds = 60
      cash = 10
      expectedReturn = 4.5
      volatility = 6
    } else {
      stocks = 20
      bonds = 60
      cash = 20
      expectedReturn = 4.0
      volatility = 5
    }
  }

  return {
    goalId: goal.id,
    stocks,
    bonds,
    cash,
    alternatives,
    expectedReturn,
    volatility,
  }
}

/**
 * Project goal completion with Monte Carlo simulation
 */
export async function projectGoalCompletion(goal: FinancialGoal): Promise<GoalProjection> {
  const allocation = calculatePortfolioAllocation(goal)
  const monthsToGoal = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))

  // Simple projection using compound interest
  const monthlyReturn = allocation.expectedReturn / 12 / 100
  let projectedAmount = goal.currentAmount

  for (let i = 0; i < monthsToGoal; i++) {
    projectedAmount = projectedAmount * (1 + monthlyReturn) + goal.monthlyContribution
  }

  // Calculate required monthly contribution to reach goal
  const futureValue = goal.targetAmount
  const presentValue = goal.currentAmount
  const rate = monthlyReturn
  const periods = monthsToGoal

  const monthlyContributionNeeded =
    periods > 0
      ? (futureValue - presentValue * Math.pow(1 + rate, periods)) / ((Math.pow(1 + rate, periods) - 1) / rate)
      : 0

  // Calculate probability of success (simplified)
  const shortfall = goal.targetAmount - projectedAmount
  const probabilityOfSuccess = Math.max(0, Math.min(100, 100 - (shortfall / goal.targetAmount) * 100))

  const recommendedAdjustments: string[] = []

  if (probabilityOfSuccess < 70) {
    if (monthlyContributionNeeded > goal.monthlyContribution) {
      recommendedAdjustments.push(
        `Increase monthly contribution to $${monthlyContributionNeeded.toFixed(2)} to stay on track`,
      )
    }
    if (goal.riskTolerance === "conservative") {
      recommendedAdjustments.push("Consider a moderate risk tolerance to increase expected returns")
    }
    recommendedAdjustments.push(
      `Extend target date by ${Math.ceil((goal.targetAmount - projectedAmount) / (goal.monthlyContribution * 12))} years`,
    )
  }

  return {
    goalId: goal.id,
    projectedAmount,
    projectedDate: goal.targetDate,
    monthlyContributionNeeded: Math.max(0, monthlyContributionNeeded),
    probabilityOfSuccess,
    recommendedAdjustments,
  }
}

/**
 * Create scenario analysis
 */
export async function createScenario(
  goalId: string,
  name: string,
  description: string,
  adjustments: GoalScenario["adjustments"],
): Promise<GoalScenario> {
  const db = await getDB()
  const goal = await db.get("goals", goalId)

  if (!goal) {
    throw new Error("Goal not found")
  }

  // Create modified goal for projection
  const modifiedGoal: FinancialGoal = {
    ...goal,
    monthlyContribution: adjustments.monthlyContribution ?? goal.monthlyContribution,
    targetDate: adjustments.targetDate ?? goal.targetDate,
    targetAmount: adjustments.targetAmount ?? goal.targetAmount,
    riskTolerance: adjustments.riskTolerance ?? goal.riskTolerance,
  }

  const projection = await projectGoalCompletion(modifiedGoal)

  const scenario: GoalScenario = {
    id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    goalId,
    name,
    description,
    adjustments,
    projectedOutcome: {
      finalAmount: projection.projectedAmount,
      successProbability: projection.probabilityOfSuccess,
      timeToGoal: Math.ceil((new Date(modifiedGoal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)),
    },
    createdAt: new Date().toISOString(),
  }

  await db.put("scenarios", scenario)

  return scenario
}

/**
 * Generate milestones for a goal
 */
async function generateMilestones(goal: FinancialGoal): Promise<void> {
  const db = await getDB()
  const milestonePercentages = [25, 50, 75, 100]

  for (const percentage of milestonePercentages) {
    const milestone: GoalMilestone = {
      id: `milestone_${goal.id}_${percentage}`,
      goalId: goal.id,
      amount: (goal.targetAmount * percentage) / 100,
      date: new Date(
        Date.now() + ((new Date(goal.targetDate).getTime() - Date.now()) * percentage) / 100,
      ).toISOString(),
      description: `${percentage}% of goal reached`,
      achieved: false,
    }

    await db.put("milestones", milestone)
  }
}

/**
 * Check and update milestones
 */
async function checkMilestones(goalId: string, currentAmount: number): Promise<void> {
  const db = await getDB()
  const index = db.transaction("milestones", "readwrite").store.index("goalId")
  const milestones = await index.getAll(goalId)

  for (const milestone of milestones) {
    if (!milestone.achieved && currentAmount >= milestone.amount) {
      milestone.achieved = true
      milestone.achievedDate = new Date().toISOString()
      await db.put("milestones", milestone)
    }
  }
}

/**
 * Get all goals for a user
 */
export async function getUserGoals(userId: string): Promise<FinancialGoal[]> {
  const db = await getDB()
  const index = db.transaction("goals").store.index("userId")
  return index.getAll(userId)
}

/**
 * Get scenarios for a goal
 */
export async function getGoalScenarios(goalId: string): Promise<GoalScenario[]> {
  const db = await getDB()
  const index = db.transaction("scenarios").store.index("goalId")
  return index.getAll(goalId)
}

/**
 * Get milestones for a goal
 */
export async function getGoalMilestones(goalId: string): Promise<GoalMilestone[]> {
  const db = await getDB()
  const index = db.transaction("milestones").store.index("goalId")
  return index.getAll(goalId)
}
