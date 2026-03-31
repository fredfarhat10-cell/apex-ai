// Alpha Brief Research Engine
// Orchestrates AI agents to generate investment research

import { openDB, type IDBPDatabase } from "idb"
import type { AlphaBrief, ResearchRequest } from "./types/alpha-brief"

const DB_NAME = "apex-alpha-briefs"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("briefs")) {
        const briefStore = db.createObjectStore("briefs", { keyPath: "id" })
        briefStore.createIndex("userId", "userId")
        briefStore.createIndex("ticker", "ticker")
        briefStore.createIndex("generatedAt", "generatedAt")
      }

      if (!db.objectStoreNames.contains("requests")) {
        const requestStore = db.createObjectStore("requests", { keyPath: "id" })
        requestStore.createIndex("userId", "userId")
        requestStore.createIndex("status", "status")
      }
    },
  })

  return dbInstance
}

/**
 * Request a new Alpha Brief for a ticker
 */
export async function requestAlphaBrief(userId: string, ticker: string): Promise<ResearchRequest> {
  const db = await getDB()

  // Check if we have a recent brief (less than 24 hours old)
  const existingBrief = await getLatestBrief(userId, ticker)
  if (existingBrief && new Date(existingBrief.expiresAt) > new Date()) {
    return {
      id: `req_${Date.now()}`,
      userId,
      ticker,
      requestedAt: new Date().toISOString(),
      status: "completed",
      briefId: existingBrief.id,
    }
  }

  const request: ResearchRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ticker: ticker.toUpperCase(),
    requestedAt: new Date().toISOString(),
    status: "pending",
  }

  await db.put("requests", request)

  // Trigger brief generation (async)
  generateAlphaBrief(request.id, userId, ticker).catch((error) => {
    console.error("[v0] Error generating alpha brief:", error)
  })

  return request
}

/**
 * Generate Alpha Brief using AI agents
 */
async function generateAlphaBrief(requestId: string, userId: string, ticker: string): Promise<AlphaBrief> {
  const db = await getDB()

  // Update request status
  const request = await db.get("requests", requestId)
  if (request) {
    request.status = "processing"
    await db.put("requests", request)
  }

  try {
    // Call the CrewAI backend to generate the brief
    const response = await fetch("/api/alpha-brief/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ticker }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate alpha brief")
    }

    const brief: AlphaBrief = await response.json()

    // Store the brief
    await db.put("briefs", brief)

    // Update request
    if (request) {
      request.status = "completed"
      request.briefId = brief.id
      await db.put("requests", request)
    }

    return brief
  } catch (error) {
    console.error("[v0] Error in generateAlphaBrief:", error)

    // Update request with error
    if (request) {
      request.status = "failed"
      request.error = error instanceof Error ? error.message : "Unknown error"
      await db.put("requests", request)
    }

    throw error
  }
}

/**
 * Get latest brief for a ticker
 */
async function getLatestBrief(userId: string, ticker: string): Promise<AlphaBrief | undefined> {
  const db = await getDB()
  const index = db.transaction("briefs").store.index("ticker")
  const briefs = await index.getAll(ticker.toUpperCase())

  // Filter by userId and sort by date
  const userBriefs = briefs
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())

  return userBriefs[0]
}

/**
 * Get brief by ID
 */
export async function getAlphaBrief(briefId: string): Promise<AlphaBrief | undefined> {
  const db = await getDB()
  return db.get("briefs", briefId)
}

/**
 * Get all briefs for a user
 */
export async function getUserBriefs(userId: string): Promise<AlphaBrief[]> {
  const db = await getDB()
  const index = db.transaction("briefs").store.index("userId")
  const briefs = await index.getAll(userId)

  return briefs.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
}

/**
 * Get request status
 */
export async function getRequestStatus(requestId: string): Promise<ResearchRequest | undefined> {
  const db = await getDB()
  return db.get("requests", requestId)
}

/**
 * Delete expired briefs
 */
export async function cleanupExpiredBriefs(): Promise<number> {
  const db = await getDB()
  const allBriefs = await db.getAll("briefs")
  const now = new Date()

  let deletedCount = 0

  for (const brief of allBriefs) {
    if (new Date(brief.expiresAt) < now) {
      await db.delete("briefs", brief.id)
      deletedCount++
    }
  }

  return deletedCount
}
