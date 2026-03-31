import { openDB, type IDBPDatabase } from "idb"
import type { VectorMemory, MemorySearchResult, MemoryStats } from "./types/memory"

const DB_NAME = "apex-vector-memory"
const STORE_NAME = "memories"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize the vector memory database
 */
async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("timestamp", "metadata.timestamp")
        store.createIndex("category", "metadata.category")
        store.createIndex("importance", "metadata.importance")
      }
    },
  })

  return dbInstance
}

/**
 * Generate embedding for text using OpenAI API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.embedding
  } catch (error) {
    console.error("[v0] Failed to generate embedding:", error)
    throw error
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Add a new memory with embedding
 */
export async function addMemory(
  content: string,
  metadata: VectorMemory["metadata"],
  context?: VectorMemory["context"],
): Promise<VectorMemory> {
  const db = await getDB()

  // Generate embedding for the content
  const embedding = await generateEmbedding(content)

  const memory: VectorMemory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    embedding,
    metadata: {
      ...metadata,
      timestamp: metadata.timestamp || new Date().toISOString(),
    },
    context,
  }

  await db.put(STORE_NAME, memory)
  console.log("[v0] Added memory:", memory.id)

  return memory
}

/**
 * Search for similar memories using semantic search
 */
export async function searchMemories(query: string, limit = 5, minSimilarity = 0.7): Promise<MemorySearchResult[]> {
  const db = await getDB()

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query)

  // Get all memories
  const allMemories = await db.getAll(STORE_NAME)

  // Calculate similarity for each memory
  const results: MemorySearchResult[] = allMemories
    .map((memory) => ({
      memory,
      similarity: cosineSimilarity(queryEmbedding, memory.embedding),
    }))
    .filter((result) => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  console.log("[v0] Found", results.length, "similar memories for query:", query)

  return results
}

/**
 * Get a specific memory by ID
 */
export async function getMemory(id: string): Promise<VectorMemory | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

/**
 * Get all memories
 */
export async function getAllMemories(): Promise<VectorMemory[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

/**
 * Delete a memory
 */
export async function deleteMemory(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
  console.log("[v0] Deleted memory:", id)
}

/**
 * Clear all memories
 */
export async function clearAllMemories(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
  console.log("[v0] Cleared all memories")
}

/**
 * Get memory statistics
 */
export async function getMemoryStats(): Promise<MemoryStats> {
  const memories = await getAllMemories()

  const categories: Record<string, number> = {}
  let totalImportance = 0
  let oldestTimestamp = Number.POSITIVE_INFINITY
  let newestTimestamp = 0

  memories.forEach((memory) => {
    const category = memory.metadata.category || "uncategorized"
    categories[category] = (categories[category] || 0) + 1

    const importance = memory.metadata.importance || 0
    totalImportance += importance

    const timestamp = new Date(memory.metadata.timestamp).getTime()
    if (timestamp < oldestTimestamp) oldestTimestamp = timestamp
    if (timestamp > newestTimestamp) newestTimestamp = timestamp
  })

  return {
    totalMemories: memories.length,
    oldestMemory: oldestTimestamp !== Number.POSITIVE_INFINITY ? new Date(oldestTimestamp).toISOString() : undefined,
    newestMemory: newestTimestamp !== 0 ? new Date(newestTimestamp).toISOString() : undefined,
    categories,
    averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
  }
}

/**
 * Get memories by category
 */
export async function getMemoriesByCategory(category: string): Promise<VectorMemory[]> {
  const db = await getDB()
  const index = db.transaction(STORE_NAME).store.index("category")
  return index.getAll(category)
}

/**
 * Get recent memories
 */
export async function getRecentMemories(limit = 10): Promise<VectorMemory[]> {
  const memories = await getAllMemories()
  return memories
    .sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime())
    .slice(0, limit)
}

/**
 * Export memories as JSON
 */
export async function exportMemories(): Promise<string> {
  const memories = await getAllMemories()
  return JSON.stringify(memories, null, 2)
}

/**
 * Import memories from JSON
 */
export async function importMemories(jsonData: string): Promise<number> {
  const db = await getDB()
  const memories: VectorMemory[] = JSON.parse(jsonData)

  let imported = 0
  for (const memory of memories) {
    await db.put(STORE_NAME, memory)
    imported++
  }

  console.log("[v0] Imported", imported, "memories")
  return imported
}
