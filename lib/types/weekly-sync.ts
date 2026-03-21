export interface WeeklySyncSession {
  id: string
  userId: string
  weekStartDate: string
  weekEndDate: string
  phase: "after-action" | "resource-audit" | "blueprint" | "execute" | "complete"
  createdAt: string
  completedAt?: string
}

export interface AfterActionReview {
  wins: Array<{
    title: string
    description: string
    category: "career" | "health" | "financial" | "personal" | "social"
    impact: "high" | "medium" | "low"
  }>
  challenges: Array<{
    title: string
    description: string
    category: "career" | "health" | "financial" | "personal" | "social"
    severity: "high" | "medium" | "low"
  }>
  keyInsight: {
    title: string
    description: string
    correlation?: string
    recommendation: string
  }
  metrics: {
    goalsCompleted: number
    totalGoals: number
    budgetAdherence: number // percentage
    energyAverage: number // 0-100
    productivityScore: number // 0-100
  }
}

export interface ResourceAudit {
  timeCapital: {
    totalHours: number
    fixedCommitments: number
    flexibleHours: number
    breakdown: Array<{
      day: string
      available: number
    }>
  }
  financialCapital: {
    weeklyBudget: number
    discretionaryFunds: number
    allocatedFunds: number
    remainingFunds: number
  }
  energyCapital: {
    currentLevel: number // 0-100
    recoveryStatus: "excellent" | "good" | "moderate" | "low"
    weeklyForecast: Array<{
      day: string
      predictedEnergy: number // 0-100
      confidence: number // 0-1
    }>
  }
}

export interface WeekBlueprint {
  themeDays: Array<{
    day: string
    date: string
    theme: "deep-work" | "networking" | "admin" | "review" | "rest"
    focus: string
    scheduledBlocks: Array<{
      startTime: string
      endTime: string
      activity: string
      type: "work" | "personal" | "health" | "social"
      priority: "high" | "medium" | "low"
    }>
    energyLevel: number // predicted 0-100
  }>
  floatingTasks: Array<{
    id: string
    title: string
    duration: number // minutes
    category: "workout" | "errands" | "personal" | "admin"
    flexibility: "high" | "medium" | "low"
    preferredDays: string[]
    deadline?: string
  }>
  strategicActions: Array<{
    title: string
    description: string
    category: "career" | "networking" | "skill-development" | "goal-milestone"
    priority: "high" | "medium" | "low"
    estimatedTime: number // minutes
    suggestedDay: string
  }>
}

export interface ExecutionConfirmation {
  calendarEventsCreated: number
  tasksAdded: number
  notificationRulesSet: number
  focusModesConfigured: number
  summary: string
  nextSteps: string[]
}

export interface WeeklySyncReport {
  session: WeeklySyncSession
  afterActionReview: AfterActionReview
  resourceAudit: ResourceAudit
  weekBlueprint: WeekBlueprint
  executionConfirmation?: ExecutionConfirmation
}
