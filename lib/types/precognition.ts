export interface UnspokenDesire {
  id: string
  timestamp: string
  desireType: "travel" | "purchase" | "career" | "relationship" | "health" | "learning"
  confidence: number // 0-1
  signals: Array<{
    type: "search" | "expense" | "conversation" | "behavior" | "calendar"
    data: string
    weight: number
  }>
  inferredIntent: string
  suggestedAction: string
  autonomousActionPlan?: {
    action: string
    steps: string[]
    estimatedCost: number
    reversible: boolean
    requiresApproval: boolean
  }
}

export interface PreCognitionEvent {
  id: string
  timestamp: string
  eventType: "opportunity-window" | "risk-spike" | "pattern-break" | "unspoken-desire"
  priority: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  context: Record<string, any>
  actionTaken: boolean
  actionDetails?: string
  outcome?: {
    success: boolean
    ruSaved: number
    userFeedback: string
  }
}

export interface AutonomousAction {
  id: string
  timestamp: string
  actionType: "booking" | "purchase" | "scheduling" | "communication" | "optimization"
  description: string
  status: "proposed" | "approved" | "executing" | "completed" | "failed"
  requiresApproval: boolean
  approvalDeadline?: string
  cost: number
  reversible: boolean
  executionPlan: {
    steps: Array<{
      order: number
      action: string
      status: "pending" | "in-progress" | "completed" | "failed"
      result?: string
    }>
  }
  ruImpact: number
}
