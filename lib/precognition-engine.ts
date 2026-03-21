import type { UnspokenDesire, PreCognitionEvent, AutonomousAction } from "./types/precognition"
import type { AppState } from "./types"

export class PreCognitionEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Detect unspoken desires from user behavior patterns
   */
  async detectUnspokenDesires(userContext: Partial<AppState>): Promise<UnspokenDesire[]> {
    const desires: UnspokenDesire[] = []

    // Detect travel desires
    const travelDesire = await this.detectTravelDesire(userContext)
    if (travelDesire) desires.push(travelDesire)

    // Detect purchase desires
    const purchaseDesire = await this.detectPurchaseDesire(userContext)
    if (purchaseDesire) desires.push(purchaseDesire)

    // Detect career desires
    const careerDesire = await this.detectCareerDesire(userContext)
    if (careerDesire) desires.push(careerDesire)

    // Detect health desires
    const healthDesire = await this.detectHealthDesire(userContext)
    if (healthDesire) desires.push(healthDesire)

    return desires
  }

  /**
   * Detect travel desires from expense patterns and behavior
   */
  private async detectTravelDesire(userContext: Partial<AppState>): Promise<UnspokenDesire | null> {
    const expenses = userContext.expenses || []
    const signals: UnspokenDesire["signals"] = []

    // Check for flight price checking behavior
    const flightExpenses = expenses.filter(
      (e) =>
        e.description.toLowerCase().includes("flight") ||
        e.description.toLowerCase().includes("airline") ||
        e.description.toLowerCase().includes("kayak") ||
        e.description.toLowerCase().includes("skyscanner"),
    )

    if (flightExpenses.length > 0) {
      signals.push({
        type: "expense",
        data: `${flightExpenses.length} flight-related searches detected`,
        weight: 0.4,
      })
    }

    // Check for travel-related expenses
    const travelExpenses = expenses.filter((e) => e.category === "Travel")
    if (travelExpenses.length > 2) {
      signals.push({
        type: "expense",
        data: `${travelExpenses.length} travel expenses in recent history`,
        weight: 0.3,
      })
    }

    // Check for destination research patterns
    const destinationKeywords = ["rio", "london", "paris", "tokyo", "bali", "iceland"]
    const destinationExpenses = expenses.filter((e) =>
      destinationKeywords.some((keyword) => e.description.toLowerCase().includes(keyword)),
    )

    if (destinationExpenses.length > 0) {
      signals.push({
        type: "search",
        data: `Detected research for specific destinations`,
        weight: 0.3,
      })
    }

    // Calculate confidence
    const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0)
    const confidence = Math.min(totalWeight, 1.0)

    if (confidence > 0.6) {
      // High confidence - propose autonomous action
      return {
        id: `desire-travel-${Date.now()}`,
        timestamp: new Date().toISOString(),
        desireType: "travel",
        confidence,
        signals,
        inferredIntent: "User is researching flights to Rio de Janeiro for upcoming trip",
        suggestedAction: "Book flight to Rio during optimal price window",
        autonomousActionPlan: {
          action: "Book round-trip flight to Rio de Janeiro",
          steps: [
            "Monitor flight prices for next 48 hours",
            "Identify optimal booking window (typically 6-8 weeks before departure)",
            "Compare prices across airlines and booking platforms",
            "Book when price drops below $850 threshold",
            "Send confirmation and itinerary to user",
          ],
          estimatedCost: 850,
          reversible: true,
          requiresApproval: true,
        },
      }
    }

    return null
  }

  /**
   * Detect purchase desires from browsing and expense patterns
   */
  private async detectPurchaseDesire(userContext: Partial<AppState>): Promise<UnspokenDesire | null> {
    const expenses = userContext.expenses || []
    const signals: UnspokenDesire["signals"] = []

    // Check for repeated small purchases in same category
    const categoryCount: Record<string, number> = {}
    expenses.forEach((e) => {
      categoryCount[e.category] = (categoryCount[e.category] || 0) + 1
    })

    const dominantCategory = Object.entries(categoryCount).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0])

    if (dominantCategory[1] > 5) {
      signals.push({
        type: "expense",
        data: `${dominantCategory[1]} purchases in ${dominantCategory[0]} category`,
        weight: 0.5,
      })

      const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0)
      const confidence = Math.min(totalWeight, 1.0)

      if (confidence > 0.4) {
        return {
          id: `desire-purchase-${Date.now()}`,
          timestamp: new Date().toISOString(),
          desireType: "purchase",
          confidence,
          signals,
          inferredIntent: `User shows strong interest in ${dominantCategory[0]} products`,
          suggestedAction: `Curate personalized ${dominantCategory[0]} recommendations`,
          autonomousActionPlan: {
            action: `Generate ${dominantCategory[0]} product recommendations`,
            steps: [
              "Analyze purchase history and preferences",
              "Identify trending products in category",
              "Compare prices across retailers",
              "Present top 3 recommendations with rationale",
            ],
            estimatedCost: 0,
            reversible: true,
            requiresApproval: false,
          },
        }
      }
    }

    return null
  }

  /**
   * Detect career desires from goals and behavior
   */
  private async detectCareerDesire(userContext: Partial<AppState>): Promise<UnspokenDesire | null> {
    const strategicGoal = userContext.strategicGoal || ""
    const expenses = userContext.expenses || []
    const signals: UnspokenDesire["signals"] = []

    // Check for career-related keywords in strategic goal
    const careerKeywords = ["promotion", "job", "career", "leadership", "manager", "director", "senior"]
    const hasCareerGoal = careerKeywords.some((keyword) => strategicGoal.toLowerCase().includes(keyword))

    if (hasCareerGoal) {
      signals.push({
        type: "behavior",
        data: "Strategic goal mentions career advancement",
        weight: 0.4,
      })
    }

    // Check for education/skill development expenses
    const educationExpenses = expenses.filter((e) => e.category === "Education")
    if (educationExpenses.length > 2) {
      signals.push({
        type: "expense",
        data: `${educationExpenses.length} education-related expenses`,
        weight: 0.3,
      })
    }

    const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0)
    const confidence = Math.min(totalWeight, 1.0)

    if (confidence > 0.5) {
      return {
        id: `desire-career-${Date.now()}`,
        timestamp: new Date().toISOString(),
        desireType: "career",
        confidence,
        signals,
        inferredIntent: "User is actively pursuing career advancement",
        suggestedAction: "Create personalized career development roadmap",
        autonomousActionPlan: {
          action: "Generate career advancement strategy",
          steps: [
            "Analyze current skills and experience",
            "Identify skill gaps for target role",
            "Recommend courses and certifications",
            "Create 6-month action plan",
            "Schedule quarterly career reviews",
          ],
          estimatedCost: 0,
          reversible: true,
          requiresApproval: false,
        },
      }
    }

    return null
  }

  /**
   * Detect health desires from habits and expenses
   */
  private async detectHealthDesire(userContext: Partial<AppState>): Promise<UnspokenDesire | null> {
    const habits = userContext.habits || []
    const expenses = userContext.expenses || []
    const signals: UnspokenDesire["signals"] = []

    // Check for health-related habits
    const healthHabits = habits.filter(
      (h) =>
        h.name.toLowerCase().includes("exercise") ||
        h.name.toLowerCase().includes("workout") ||
        h.name.toLowerCase().includes("gym") ||
        h.name.toLowerCase().includes("run"),
    )

    if (healthHabits.length > 0) {
      signals.push({
        type: "behavior",
        data: `${healthHabits.length} health-related habits tracked`,
        weight: 0.3,
      })
    }

    // Check for health expenses
    const healthExpenses = expenses.filter((e) => e.category === "Health")
    if (healthExpenses.length > 2) {
      signals.push({
        type: "expense",
        data: `${healthExpenses.length} health-related expenses`,
        weight: 0.3,
      })
    }

    const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0)
    const confidence = Math.min(totalWeight, 1.0)

    if (confidence > 0.4) {
      return {
        id: `desire-health-${Date.now()}`,
        timestamp: new Date().toISOString(),
        desireType: "health",
        confidence,
        signals,
        inferredIntent: "User is prioritizing health and wellness",
        suggestedAction: "Optimize wellness routine with personalized recommendations",
        autonomousActionPlan: {
          action: "Generate personalized wellness optimization plan",
          steps: [
            "Analyze current health metrics and habits",
            "Identify optimization opportunities",
            "Recommend evidence-based interventions",
            "Create sustainable wellness routine",
            "Set up progress tracking",
          ],
          estimatedCost: 0,
          reversible: true,
          requiresApproval: false,
        },
      }
    }

    return null
  }

  /**
   * Create autonomous action from unspoken desire
   */
  async createAutonomousAction(desire: UnspokenDesire): Promise<AutonomousAction> {
    if (!desire.autonomousActionPlan) {
      throw new Error("No autonomous action plan available for this desire")
    }

    const plan = desire.autonomousActionPlan

    return {
      id: `action-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: this.mapDesireToActionType(desire.desireType),
      description: plan.action,
      status: plan.requiresApproval ? "proposed" : "approved",
      requiresApproval: plan.requiresApproval,
      approvalDeadline: plan.requiresApproval ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : undefined,
      cost: plan.estimatedCost,
      reversible: plan.reversible,
      executionPlan: {
        steps: plan.steps.map((step, index) => ({
          order: index + 1,
          action: step,
          status: "pending" as const,
        })),
      },
      ruImpact: Math.round(desire.confidence * 50), // Higher confidence = more RU saved
    }
  }

  /**
   * Execute autonomous action
   */
  async executeAutonomousAction(action: AutonomousAction): Promise<PreCognitionEvent> {
    console.log("[v0] Executing autonomous action:", action.description)

    // Simulate execution
    for (const step of action.executionPlan.steps) {
      step.status = "in-progress"
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing
      step.status = "completed"
      step.result = `Completed: ${step.action}`
    }

    action.status = "completed"

    return {
      id: `event-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "unspoken-desire",
      priority: "high",
      title: "Autonomous Action Completed",
      description: action.description,
      context: {
        actionId: action.id,
        cost: action.cost,
        ruImpact: action.ruImpact,
      },
      actionTaken: true,
      actionDetails: action.executionPlan.steps.map((s) => s.result).join(" → "),
      outcome: {
        success: true,
        ruSaved: action.ruImpact,
        userFeedback: "Action completed successfully",
      },
    }
  }

  /**
   * Monitor for pre-cognition events
   */
  async monitorPreCognitionEvents(userContext: Partial<AppState>): Promise<PreCognitionEvent[]> {
    const events: PreCognitionEvent[] = []

    // Check for opportunity windows
    const aura = userContext.aura || "Neutral"
    if (aura === "Energized" || aura === "Focused") {
      events.push({
        id: `event-opportunity-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: "opportunity-window",
        priority: "high",
        title: "Peak Performance Window Detected",
        description: "Your energy and focus levels are optimal for high-value work",
        context: { aura, recommendation: "Tackle your most challenging task now" },
        actionTaken: false,
      })
    }

    // Check for pattern breaks
    const habitLogs = userContext.habitLogs || []
    const recentLogs = habitLogs.slice(-7)
    const completionRate = recentLogs.filter((log) => log.completed).length / Math.max(recentLogs.length, 1)

    if (completionRate < 0.3) {
      events.push({
        id: `event-pattern-break-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: "pattern-break",
        priority: "critical",
        title: "Habit Completion Rate Dropped Significantly",
        description: "Your habit completion rate has dropped 60% this week - potential burnout detected",
        context: { completionRate, recommendation: "Schedule recovery day immediately" },
        actionTaken: false,
      })
    }

    // Check for risk spikes
    const expenses = userContext.expenses || []
    const recentExpenses = expenses.slice(-7)
    const avgExpense = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / Math.max(recentExpenses.length, 1)
    const historicalAvg = expenses.reduce((sum, e) => sum + e.amount, 0) / Math.max(expenses.length, 1)

    if (avgExpense > historicalAvg * 1.5) {
      events.push({
        id: `event-risk-spike-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: "risk-spike",
        priority: "high",
        title: "Spending Spike Detected",
        description: "Your spending has increased 50% above normal - budget risk detected",
        context: { avgExpense, historicalAvg, recommendation: "Review budget and adjust spending" },
        actionTaken: false,
      })
    }

    return events
  }

  // Helper methods
  private mapDesireToActionType(desireType: UnspokenDesire["desireType"]): AutonomousAction["actionType"] {
    const mapping: Record<UnspokenDesire["desireType"], AutonomousAction["actionType"]> = {
      travel: "booking",
      purchase: "purchase",
      career: "optimization",
      relationship: "communication",
      health: "optimization",
      learning: "scheduling",
    }

    return mapping[desireType] || "optimization"
  }
}
