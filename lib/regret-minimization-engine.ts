import type { RegretUnit, PreCognitionTrigger } from "./types/regret-engine"
import type { AppState } from "./types"

export class RegretMinimizationEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Layer 1: Opportunity Cost Calculator
   * Quantifies what you're giving up by choosing Path A over Path B
   */
  private calculateOpportunityCost(decision: string, userContext: Partial<AppState>, alternatives: string[]): number {
    const strategicAlignment = this.assessStrategicAlignment(decision, userContext.strategicGoal || "")
    const resourceAllocation = this.assessResourceAllocation(decision, userContext)
    const timeValue = this.assessTimeValue(decision, userContext)

    // Weighted average: strategic alignment (40%), resource allocation (30%), time value (30%)
    return Math.round(strategicAlignment * 0.4 + resourceAllocation * 0.3 + timeValue * 0.3)
  }

  /**
   * Layer 2: Emotional Impact Predictor
   * Predicts future emotional state based on decision
   */
  private calculateEmotionalImpact(decision: string, userContext: Partial<AppState>): number {
    const moodHistory = userContext.moodHistory || []
    const currentAura = userContext.aura || "Neutral"

    // Analyze if decision aligns with positive mood patterns
    const positivePatterns = moodHistory.filter((m) => m.mood === "Happy" || m.mood === "Excited").length
    const totalPatterns = moodHistory.length || 1

    const emotionalBaseline = (positivePatterns / totalPatterns) * 100

    // Adjust based on current aura
    const auraMultiplier = this.getAuraMultiplier(currentAura)

    return Math.min(100, Math.round(emotionalBaseline * auraMultiplier))
  }

  /**
   * Layer 3: Compounding Effect Analyzer
   * Calculates how this decision ripples across life domains
   */
  private calculateCompoundingEffect(decision: string, userContext: Partial<AppState>): number {
    const domains = ["career", "financial", "health", "social", "time"]
    let totalImpact = 0

    // Simulate impact across domains
    domains.forEach((domain) => {
      const domainImpact = this.simulateDomainImpact(decision, domain, userContext)
      totalImpact += domainImpact
    })

    return Math.round(totalImpact / domains.length)
  }

  /**
   * Layer 4: Alignment Gap Detector
   * Measures distance between decision and core values/goals
   */
  private calculateAlignmentGap(decision: string, strategicGoal: string): number {
    const decisionWords = decision.toLowerCase().split(" ")
    const goalWords = strategicGoal.toLowerCase().split(" ")

    const overlap = decisionWords.filter((word) => goalWords.includes(word)).length
    const totalWords = Math.max(decisionWords.length, goalWords.length)

    const alignmentScore = (overlap / totalWords) * 100

    // Invert: higher gap = lower alignment
    return Math.round(100 - alignmentScore)
  }

  /**
   * Layer 5: Time Horizon Weighting
   * Adjusts regret based on when consequences manifest
   */
  private calculateTimeHorizon(decision: string, urgency: string): number {
    const horizonWeights = {
      immediate: 90, // High regret potential for immediate decisions
      "short-term": 60, // Moderate regret potential
      "long-term": 30, // Lower immediate regret, but compounds over time
    }

    return horizonWeights[urgency as keyof typeof horizonWeights] || 50
  }

  /**
   * Master RU Calculator
   * Combines all 5 layers into final Regret Unit score
   */
  async calculateRegretUnits(
    decision: string,
    context: RegretUnit["context"],
    userContext: Partial<AppState>,
    alternatives: string[] = [],
  ): Promise<RegretUnit> {
    const ruBreakdown = {
      opportunityCost: this.calculateOpportunityCost(decision, userContext, alternatives),
      emotionalImpact: this.calculateEmotionalImpact(decision, userContext),
      compoundingEffect: this.calculateCompoundingEffect(decision, userContext),
      alignmentGap: this.calculateAlignmentGap(decision, userContext.strategicGoal || ""),
      timeHorizon: this.calculateTimeHorizon(decision, context.urgency),
    }

    // Calculate weighted RU score
    const ruScore = Math.round(
      ruBreakdown.opportunityCost * 0.25 +
        ruBreakdown.emotionalImpact * 0.2 +
        ruBreakdown.compoundingEffect * 0.25 +
        ruBreakdown.alignmentGap * 0.2 +
        ruBreakdown.timeHorizon * 0.1,
    )

    // Generate alternative paths
    const alternativePaths = await this.generateAlternativePaths(decision, context, userContext)

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(decision, ruBreakdown, context)

    return {
      id: `ru-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      decision,
      context,
      ruScore,
      ruBreakdown,
      alternativePaths,
      mitigationStrategies,
      status: "pending",
    }
  }

  /**
   * Generate alternative decision paths with projected RU scores
   */
  private async generateAlternativePaths(
    decision: string,
    context: RegretUnit["context"],
    userContext: Partial<AppState>,
  ): Promise<RegretUnit["alternativePaths"]> {
    const alternatives = [
      {
        id: `alt-1-${Date.now()}`,
        description: `Delay decision by 24 hours for more data`,
        projectedRU: 15,
        probability: 0.8,
        timeline: "24 hours",
      },
      {
        id: `alt-2-${Date.now()}`,
        description: `Seek expert consultation before deciding`,
        projectedRU: 20,
        probability: 0.7,
        timeline: "2-3 days",
      },
      {
        id: `alt-3-${Date.now()}`,
        description: `Test with small commitment first`,
        projectedRU: 25,
        probability: 0.9,
        timeline: "1 week",
      },
    ]

    return alternatives
  }

  /**
   * Generate mitigation strategies to reduce regret potential
   */
  private generateMitigationStrategies(
    decision: string,
    ruBreakdown: RegretUnit["ruBreakdown"],
    context: RegretUnit["context"],
  ): string[] {
    const strategies: string[] = []

    if (ruBreakdown.opportunityCost > 70) {
      strategies.push("Create a reversibility plan with clear exit criteria")
      strategies.push("Set a 30-day review checkpoint to reassess")
    }

    if (ruBreakdown.emotionalImpact > 70) {
      strategies.push("Journal your reasoning now to validate future emotions")
      strategies.push("Schedule a check-in with trusted advisor in 1 week")
    }

    if (ruBreakdown.compoundingEffect > 70) {
      strategies.push("Map out 2nd and 3rd order consequences before committing")
      strategies.push("Identify which life domains will be most affected")
    }

    if (ruBreakdown.alignmentGap > 70) {
      strategies.push("Revisit your strategic goal - has it changed?")
      strategies.push("Consider if this decision serves a hidden priority")
    }

    if (context.reversibility === "irreversible") {
      strategies.push("Sleep on it for 72 hours minimum")
      strategies.push("Consult with 3 people who've made similar decisions")
    }

    return strategies
  }

  /**
   * Detect pre-cognition triggers from user behavior patterns
   */
  async detectPreCognitionTriggers(userContext: Partial<AppState>): Promise<PreCognitionTrigger[]> {
    const triggers: PreCognitionTrigger[] = []

    const unspokenDesire = await this.detectUnspokenDesire(userContext)
    if (unspokenDesire) {
      triggers.push(unspokenDesire)
    }

    const patternBreak = await this.detectPatternBreak(userContext)
    if (patternBreak) {
      triggers.push(patternBreak)
    }

    const opportunityWindow = await this.detectOpportunityWindow(userContext)
    if (opportunityWindow) {
      triggers.push(opportunityWindow)
    }

    return triggers
  }

  /**
   * Helper: Detect unspoken desires from behavior patterns
   */
  private async detectUnspokenDesire(userContext: Partial<AppState>): Promise<PreCognitionTrigger | null> {
    const expenses = userContext.expenses || []
    const habits = userContext.habits || []

    // Example: Detect travel desire from browsing patterns
    const travelExpenses = expenses.filter(
      (e) => e.category === "Travel" || e.description.toLowerCase().includes("flight"),
    )

    if (travelExpenses.length > 3) {
      return {
        id: `trigger-${Date.now()}`,
        timestamp: new Date().toISOString(),
        triggerType: "unspoken-desire",
        confidence: 0.75,
        signal: "Detected increased travel research and flight price checking",
        suggestedAction: "Book that trip to Rio you've been researching - optimal price window detected",
        ruImpact: 45,
        autonomousActionAvailable: true,
      }
    }

    return null
  }

  /**
   * Helper: Detect pattern breaks that signal change
   */
  private async detectPatternBreak(userContext: Partial<AppState>): Promise<PreCognitionTrigger | null> {
    const habitLogs = userContext.habitLogs || []
    const recentLogs = habitLogs.slice(-7) // Last 7 days

    const completionRate = recentLogs.filter((log) => log.completed).length / recentLogs.length

    if (completionRate < 0.3) {
      return {
        id: `trigger-${Date.now()}`,
        timestamp: new Date().toISOString(),
        triggerType: "pattern-break",
        confidence: 0.85,
        signal: "Habit completion rate dropped 60% this week",
        suggestedAction: "Schedule recovery day - burnout risk detected",
        ruImpact: 65,
        autonomousActionAvailable: false,
      }
    }

    return null
  }

  /**
   * Helper: Detect opportunity windows
   */
  private async detectOpportunityWindow(userContext: Partial<AppState>): Promise<PreCognitionTrigger | null> {
    const aura = userContext.aura || "Neutral"

    if (aura === "Energized" || aura === "Focused") {
      return {
        id: `trigger-${Date.now()}`,
        timestamp: new Date().toISOString(),
        triggerType: "opportunity-window",
        confidence: 0.9,
        signal: "Peak energy state detected with clear calendar",
        suggestedAction: "Tackle your most challenging task now - optimal cognitive conditions",
        ruImpact: 30,
        autonomousActionAvailable: false,
      }
    }

    return null
  }

  // Helper methods
  private assessStrategicAlignment(decision: string, strategicGoal: string): number {
    const decisionLower = decision.toLowerCase()
    const goalLower = strategicGoal.toLowerCase()

    const keywords = goalLower.split(" ").filter((word) => word.length > 3)
    const matches = keywords.filter((keyword) => decisionLower.includes(keyword)).length

    return Math.round((matches / Math.max(keywords.length, 1)) * 100)
  }

  private assessResourceAllocation(decision: string, userContext: Partial<AppState>): number {
    // Simplified: Check if decision involves significant resource commitment
    const expenses = userContext.expenses || []
    const avgExpense = expenses.reduce((sum, e) => sum + e.amount, 0) / Math.max(expenses.length, 1)

    // If decision mentions money/time, assess impact
    if (decision.toLowerCase().includes("buy") || decision.toLowerCase().includes("invest")) {
      return 70 // High resource allocation
    }

    return 30 // Low resource allocation
  }

  private assessTimeValue(decision: string, userContext: Partial<AppState>): number {
    // Simplified: Assess time commitment
    if (decision.toLowerCase().includes("commit") || decision.toLowerCase().includes("long-term")) {
      return 80 // High time value
    }

    return 40 // Moderate time value
  }

  private getAuraMultiplier(aura: string): number {
    const multipliers: Record<string, number> = {
      Energized: 1.2,
      Focused: 1.1,
      Creative: 1.0,
      Neutral: 1.0,
      Tired: 0.8,
      Stressed: 0.7,
    }

    return multipliers[aura] || 1.0
  }

  private simulateDomainImpact(decision: string, domain: string, userContext: Partial<AppState>): number {
    // Simplified domain impact simulation
    const decisionLower = decision.toLowerCase()

    const domainKeywords: Record<string, string[]> = {
      career: ["job", "work", "career", "promotion", "project"],
      financial: ["money", "invest", "buy", "save", "spend"],
      health: ["health", "exercise", "sleep", "wellness", "fitness"],
      social: ["friend", "family", "relationship", "social", "network"],
      time: ["time", "schedule", "calendar", "deadline", "commitment"],
    }

    const keywords = domainKeywords[domain] || []
    const matches = keywords.filter((keyword) => decisionLower.includes(keyword)).length

    return Math.round((matches / Math.max(keywords.length, 1)) * 100)
  }
}
