export type ActionItemType = "email" | "calendar" | "notion" | "apex-insight"
export type ActionItemStatus = "action" | "snoozed" | "done"

export interface ActionItem {
  id: string
  type: ActionItemType
  title: string
  sender: string
  source: string
  timestamp: Date
  content: string
  priority: number
  status: ActionItemStatus
  summary?: string // AI-generated summary
  suggestedAction?: string // AI-suggested next action
  metadata?: {
    threadId?: string
    eventId?: string
    taskId?: string
  }
}
