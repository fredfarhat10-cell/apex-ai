import { openDB } from "idb"

export interface ErrorLog {
  id: string
  timestamp: number
  type: "api_error" | "validation_error" | "network_error" | "system_error"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  stack?: string
  context?: Record<string, any>
  resolved: boolean
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private db: any

  private constructor() {
    this.initDB()
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  private async initDB() {
    this.db = await openDB("apex-error-logs", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("errors")) {
          const store = db.createObjectStore("errors", { keyPath: "id" })
          store.createIndex("timestamp", "timestamp")
          store.createIndex("severity", "severity")
          store.createIndex("resolved", "resolved")
        }
      },
    })
  }

  async logError(error: Omit<ErrorLog, "id" | "timestamp" | "resolved">): Promise<void> {
    const errorLog: ErrorLog = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
    }

    await this.db.put("errors", errorLog)

    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(errorLog)
    }

    console.error("[Apex Error]", errorLog)
  }

  private sendToMonitoring(error: ErrorLog): void {
    // Integration with Sentry or similar
    if (typeof window !== "undefined" && (window as any).Sentry) {
      ;(window as any).Sentry.captureException(new Error(error.message), {
        level: error.severity,
        extra: error.context,
      })
    }
  }

  async getErrors(filters?: {
    severity?: ErrorLog["severity"]
    resolved?: boolean
    limit?: number
  }): Promise<ErrorLog[]> {
    const tx = this.db.transaction("errors", "readonly")
    const store = tx.objectStore("errors")
    let errors = await store.getAll()

    if (filters?.severity) {
      errors = errors.filter((e: ErrorLog) => e.severity === filters.severity)
    }

    if (filters?.resolved !== undefined) {
      errors = errors.filter((e: ErrorLog) => e.resolved === filters.resolved)
    }

    errors.sort((a: ErrorLog, b: ErrorLog) => b.timestamp - a.timestamp)

    if (filters?.limit) {
      errors = errors.slice(0, filters.limit)
    }

    return errors
  }

  async resolveError(errorId: string): Promise<void> {
    const error = await this.db.get("errors", errorId)
    if (error) {
      error.resolved = true
      await this.db.put("errors", error)
    }
  }

  async clearOldErrors(daysOld = 30): Promise<void> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000
    const tx = this.db.transaction("errors", "readwrite")
    const store = tx.objectStore("errors")
    const index = store.index("timestamp")

    const oldErrors = await index.getAll(IDBKeyRange.upperBound(cutoffTime))

    for (const error of oldErrors) {
      if (error.resolved) {
        await store.delete(error.id)
      }
    }
  }
}

// Retry logic with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
  } = {},
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, backoffMultiplier = 2 } = options

  let lastError: Error
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        break
      }

      console.log(`[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * backoffMultiplier, maxDelay)
    }
  }

  throw lastError!
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: "closed" | "open" | "half-open" = "closed"

  constructor(
    private threshold = 5,
    private timeout = 60000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open"
      } else {
        throw new Error("Circuit breaker is open")
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = "closed"
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.threshold) {
      this.state = "open"
    }
  }

  getState(): string {
    return this.state
  }
}
