export interface VoiceCommand {
  id: string
  text: string
  intent: string
  parameters: Record<string, any>
  timestamp: number
  userId: string
}

export interface VoiceCommandExecution {
  taskId: string
  command: VoiceCommand
  status: "pending" | "processing" | "completed" | "failed" | "needs_clarification"
  progress: number
  currentStep?: string
  result?: any
  error?: string
  clarificationQuestion?: string
  createdAt: number
  updatedAt: number
}

export interface VoiceIntent {
  name: string
  confidence: number
  parameters: Record<string, any>
}

// Supported voice command intents
export type SupportedIntent =
  | "book_ride"
  | "search_flights"
  | "book_hotel"
  | "find_activities"
  | "check_calendar"
  | "check_budget"
  | "check_energy"
  | "generate_alpha_brief"
  | "plan_trip"
  | "schedule_meeting"
  | "set_reminder"
  | "check_weather"
  | "unknown"
