/**
 * Client-side error monitoring and logging
 * Privacy-first: No external services, all logs stay local
 */

export interface ErrorLog {
  id: string
  timestamp: string
  type: "error" | "warning" | "info"
  message: string
  stack?: string
  context?: Record<string, any>
  userAgent: string
  url: string
}

const ERROR_LOG_KEY = "apex-error-logs"
const MAX_LOGS = 100

/**
 * Logs an error to local storage
 */
export function logError(
  message: string,
  error?: Error,
  context?: Record<string, any>,
  type: "error" | "warning" | "info" = "error",
): void {
  if (typeof window === "undefined") return

  const errorLog: ErrorLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    stack: error?.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  try {
    const existingLogs = getErrorLogs()
    const updatedLogs = [errorLog, ...existingLogs].slice(0, MAX_LOGS)
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(updatedLogs))

    // Also log to console in development
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      console.error("[Error Monitor]", errorLog)
    }
  } catch (e) {
    console.error("[Error Monitor] Failed to log error:", e)
  }
}

/**
 * Retrieves all error logs
 */
export function getErrorLogs(): ErrorLog[] {
  if (typeof window === "undefined") return []

  try {
    const logs = localStorage.getItem(ERROR_LOG_KEY)
    return logs ? JSON.parse(logs) : []
  } catch {
    return []
  }
}

/**
 * Clears all error logs
 */
export function clearErrorLogs(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ERROR_LOG_KEY)
}

/**
 * Exports error logs as JSON
 */
export function exportErrorLogs(): string {
  const logs = getErrorLogs()
  return JSON.stringify(logs, null, 2)
}

/**
 * Initializes global error handlers
 */
export function initErrorMonitoring(): void {
  if (typeof window === "undefined") return

  // Catch unhandled errors
  window.addEventListener("error", (event) => {
    logError(event.message, event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logError(`Unhandled Promise Rejection: ${event.reason}`, event.reason instanceof Error ? event.reason : undefined, {
      promise: event.promise,
    })
  })

  // Log when app goes offline/online
  window.addEventListener("offline", () => {
    logError("App went offline", undefined, undefined, "warning")
  })

  window.addEventListener("online", () => {
    logError("App came back online", undefined, undefined, "info")
  })
}

/**
 * Gets error statistics
 */
export function getErrorStats(): {
  total: number
  byType: Record<string, number>
  recent: ErrorLog[]
} {
  const logs = getErrorLogs()

  const byType = logs.reduce(
    (acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    total: logs.length,
    byType,
    recent: logs.slice(0, 10),
  }
}
