import { openDB, type IDBPDatabase } from "idb"

export interface AdaptiveMemory {
  id: string
  content: string
  category: "preference" | "pattern" | "feedback" | "goal" | "communication"
  timestamp: number
  accessCount: number
  lastAccessed: number | null
  importance: number // 1-10 scale
  context?: {
    source: string
    relatedMemories?: string[]
  }
}

export class AdaptiveMemoryManager {
  private static instance: AdaptiveMemoryManager
  private db: IDBPDatabase | null = null

  private constructor() {
    this.initDB()
  }

  static getInstance(): AdaptiveMemoryManager {
    if (!AdaptiveMemoryManager.instance) {
      AdaptiveMemoryManager.instance = new AdaptiveMemoryManager()
    }
    return AdaptiveMemoryManager.instance
  }

  private async initDB() {
    this.db = await openDB("apex-adaptive-memory", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("memories")) {
          const store = db.createObjectStore("memories", { keyPath: "id" })
          store.createIndex("category", "category")
          store.createIndex("timestamp", "timestamp")
          store.createIndex("importance", "importance")
          store.createIndex("accessCount", "accessCount")
        }
      },
    })
  }

  async storeMemory(
    memory: Omit<AdaptiveMemory, "id" | "timestamp" | "accessCount" | "lastAccessed">,
  ): Promise<string> {
    if (!this.db) await this.initDB()

    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullMemory: AdaptiveMemory = {
      ...memory,
      id,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: null,
    }

    await this.db!.put("memories", fullMemory)
    return id
  }

  async getMemoriesByCategory(category: AdaptiveMemory["category"], limit = 10): Promise<AdaptiveMemory[]> {
    if (!this.db) await this.initDB()

    const tx = this.db!.transaction("memories", "readonly")
    const index = tx.store.index("category")
    const memories = await index.getAll(category)

    // Sort by importance and recency
    memories.sort((a, b) => {
      const scoreA = a.importance * 0.7 + a.accessCount * 0.3
      const scoreB = b.importance * 0.7 + b.accessCount * 0.3
      return scoreB - scoreA
    })

    return memories.slice(0, limit)
  }

  async searchMemories(query: string, limit = 5): Promise<AdaptiveMemory[]> {
    if (!this.db) await this.initDB()

    const allMemories = await this.db!.getAll("memories")

    // Simple text search (in production, use vector embeddings)
    const matches = allMemories.filter((memory) => memory.content.toLowerCase().includes(query.toLowerCase()))

    // Update access counts
    for (const memory of matches) {
      memory.accessCount++
      memory.lastAccessed = Date.now()
      await this.db!.put("memories", memory)
    }

    // Sort by relevance (importance + access count)
    matches.sort((a, b) => {
      const scoreA = a.importance * 0.7 + a.accessCount * 0.3
      const scoreB = b.importance * 0.7 + b.accessCount * 0.3
      return scoreB - scoreA
    })

    return matches.slice(0, limit)
  }

  async getRecentMemories(limit = 10): Promise<AdaptiveMemory[]> {
    if (!this.db) await this.initDB()

    const tx = this.db!.transaction("memories", "readonly")
    const index = tx.store.index("timestamp")
    const memories = await index.getAll()

    return memories.reverse().slice(0, limit)
  }

  async updateMemoryImportance(memoryId: string, importance: number): Promise<void> {
    if (!this.db) await this.initDB()

    const memory = await this.db!.get("memories", memoryId)
    if (memory) {
      memory.importance = Math.max(1, Math.min(10, importance))
      await this.db!.put("memories", memory)
    }
  }

  async deleteMemory(memoryId: string): Promise<void> {
    if (!this.db) await this.initDB()
    await this.db!.delete("memories", memoryId)
  }

  async getMemoryStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    avgImportance: number
  }> {
    if (!this.db) await this.initDB()

    const allMemories = await this.db!.getAll("memories")

    const byCategory: Record<string, number> = {}
    let totalImportance = 0

    for (const memory of allMemories) {
      byCategory[memory.category] = (byCategory[memory.category] || 0) + 1
      totalImportance += memory.importance
    }

    return {
      total: allMemories.length,
      byCategory,
      avgImportance: allMemories.length > 0 ? totalImportance / allMemories.length : 0,
    }
  }
}
