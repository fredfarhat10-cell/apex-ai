export type GenerativeContentType = "audio" | "video" | "image"

export interface GenerativeRequest {
  id: string
  type: GenerativeContentType
  prompt: string
  context: any
  status: "pending" | "generating" | "completed" | "failed"
  result?: GenerativeContent
  createdAt: Date
  completedAt?: Date
}

export interface GenerativeContent {
  id: string
  type: GenerativeContentType
  url: string
  thumbnail?: string
  metadata: any
}

export interface PromptTemplate {
  id: string
  name: string
  type: GenerativeContentType
  template: string
  parameters: string[]
}

export interface GoalVisualization {
  id: string
  userId: string
  goalId: string
  goalDescription: string
  imageUrl: string
  prompt: string
  generatedAt: Date
}

export interface CanvasBlock {
  id: string
  type: "text" | "image" | "video" | "audio"
  content: any
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

export interface SynergyCanvas {
  id: string
  userId: string
  name: string
  blocks: CanvasBlock[]
  createdAt: Date
  updatedAt: Date
}

export interface CanvasCommand {
  action: "add" | "move" | "resize" | "delete" | "generate"
  blockId?: string
  blockType?: CanvasBlock["type"]
  content?: any
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  prompt?: string
}
