export interface VectorMemory {
  id: string
  content: string
  embedding: number[]
  metadata: {
    timestamp: string
    source: "conversation" | "user-input" | "system"
    category?: string
    importance?: number
    tags?: string[]
  }
  context?: {
    conversationId?: string
    userId?: string
    relatedMemories?: string[]
  }
}

export interface MemorySearchResult {
  memory: VectorMemory
  similarity: number
}

export interface MemoryStats {
  totalMemories: number
  oldestMemory?: string
  newestMemory?: string
  categories: Record<string, number>
  averageImportance: number
}
