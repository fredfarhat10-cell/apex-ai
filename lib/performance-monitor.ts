// Performance monitoring utility for Apex AI Assistant
// Tracks key metrics without sending data to any server

interface PerformanceMetrics {
  pageLoad: number
  apiCalls: { endpoint: string; duration: number; timestamp: number }[]
  errors: { message: string; timestamp: number }[]
  memoryUsage?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoad: 0,
    apiCalls: [],
    errors: [],
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring() {
    // Track page load time
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (perfData) {
        this.metrics.pageLoad = perfData.loadEventEnd - perfData.fetchStart
        console.log("[v0] Page load time:", this.metrics.pageLoad.toFixed(2), "ms")
      }
    })

    // Track memory usage (if available)
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1048576 // Convert to MB
      }, 30000) // Check every 30 seconds
    }
  }

  trackApiCall(endpoint: string, startTime: number) {
    const duration = performance.now() - startTime
    this.metrics.apiCalls.push({
      endpoint,
      duration,
      timestamp: Date.now(),
    })

    // Keep only last 50 API calls
    if (this.metrics.apiCalls.length > 50) {
      this.metrics.apiCalls.shift()
    }

    console.log(`[v0] API call to ${endpoint} took ${duration.toFixed(2)}ms`)
  }

  trackError(error: Error) {
    this.metrics.errors.push({
      message: error.message,
      timestamp: Date.now(),
    })

    // Keep only last 20 errors
    if (this.metrics.errors.length > 20) {
      this.metrics.errors.shift()
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getAverageApiTime(): number {
    if (this.metrics.apiCalls.length === 0) return 0
    const total = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0)
    return total / this.metrics.apiCalls.length
  }

  getSlowestApiCalls(count = 5) {
    return [...this.metrics.apiCalls].sort((a, b) => b.duration - a.duration).slice(0, count)
  }

  clearMetrics() {
    this.metrics = {
      pageLoad: 0,
      apiCalls: [],
      errors: [],
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Helper function to wrap API calls with performance tracking
export async function trackApiCall<T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> {
  const startTime = performance.now()
  try {
    const result = await apiCall()
    performanceMonitor.trackApiCall(endpoint, startTime)
    return result
  } catch (error) {
    performanceMonitor.trackApiCall(endpoint, startTime)
    if (error instanceof Error) {
      performanceMonitor.trackError(error)
    }
    throw error
  }
}
