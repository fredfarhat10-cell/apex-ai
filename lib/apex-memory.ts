// Local memory management using IndexedDB
import { openDB, type IDBPDatabase } from "idb"

interface ApexMemory {
  name: string
  tone: "motivational" | "supportive" | "chill" | "professional"
  focusAreas: string[]
  frequency: "daily" | "on-demand" | "not-sure"
  lastActive: string
  conversationHistory: Array<{
    role: "apex" | "user"
    content: string
    timestamp: string
  }>
  preferences: Record<string, any>
}

const DB_NAME = "apex-memory"
const STORE_NAME = "user-data"

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function saveMemory(memory: Partial<ApexMemory>): Promise<void> {
  const db = await getDB()
  const existing = (await db.get(STORE_NAME, "memory")) || {}
  await db.put(STORE_NAME, { ...existing, ...memory, lastActive: new Date().toISOString() }, "memory")
}

export async function getMemory(): Promise<ApexMemory | null> {
  const db = await getDB()
  return db.get(STORE_NAME, "memory")
}

export async function clearMemory(): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, "memory")
}

export async function exportMemory(): Promise<string> {
  const memory = await getMemory()
  return JSON.stringify(memory, null, 2)
}

export async function importMemory(data: string): Promise<void> {
  const memory = JSON.parse(data)
  await saveMemory(memory)
}
