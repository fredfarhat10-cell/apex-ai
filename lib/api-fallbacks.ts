import { ErrorHandler } from "./error-handler"

const errorHandler = ErrorHandler.getInstance()

export interface FallbackConfig {
  useCachedData?: boolean
  useDefaultValues?: boolean
  showUserMessage?: boolean
  retryable?: boolean
}

export class APIFallbackManager {
  // Plaid fallback
  static async handlePlaidError(error: any, config: FallbackConfig = {}): Promise<any> {
    await errorHandler.logError({
      type: "api_error",
      severity: "high",
      message: `Plaid API error: ${error.message}`,
      context: { error, config },
    })

    if (config.useCachedData) {
      // Return cached account data
      return this.getCachedPlaidData()
    }

    if (config.useDefaultValues) {
      return {
        accounts: [],
        message: "Unable to fetch account data. Please try again later.",
      }
    }

    throw error
  }

  // Pinterest fallback
  static async handlePinterestError(error: any, config: FallbackConfig = {}): Promise<any> {
    await errorHandler.logError({
      type: "api_error",
      severity: "medium",
      message: `Pinterest API error: ${error.message}`,
      context: { error, config },
    })

    if (config.useDefaultValues) {
      // Return placeholder images
      return {
        images: [
          {
            url: "/aesthetic-background.jpg",
            title: "Default Background",
          },
        ],
      }
    }

    throw error
  }

  // Wearable integration fallback
  static async handleWearableError(
    error: any,
    deviceType: "whoop" | "garmin" | "apple" | "google",
    config: FallbackConfig = {},
  ): Promise<any> {
    await errorHandler.logError({
      type: "api_error",
      severity: "medium",
      message: `${deviceType} API error: ${error.message}`,
      context: { error, deviceType, config },
    })

    if (config.useCachedData) {
      return this.getCachedBiometricData(deviceType)
    }

    if (config.useDefaultValues) {
      return {
        recovery: 50,
        hrv: 50,
        sleep: 7,
        message: `Unable to sync with ${deviceType}. Showing last known data.`,
      }
    }

    throw error
  }

  // CrewAI backend fallback
  static async handleCrewAIError(error: any, taskType: string, config: FallbackConfig = {}): Promise<any> {
    await errorHandler.logError({
      type: "api_error",
      severity: "high",
      message: `CrewAI task error: ${error.message}`,
      context: { error, taskType, config },
    })

    if (config.useDefaultValues) {
      return {
        status: "error",
        message: "AI agents are temporarily unavailable. Please try again in a few minutes.",
        fallback: true,
      }
    }

    throw error
  }

  // Generic API fallback
  static async handleGenericAPIError(error: any, apiName: string, config: FallbackConfig = {}): Promise<any> {
    await errorHandler.logError({
      type: "api_error",
      severity: "medium",
      message: `${apiName} API error: ${error.message}`,
      context: { error, apiName, config },
    })

    if (config.showUserMessage) {
      return {
        error: true,
        message: `We're having trouble connecting to ${apiName}. Please try again later.`,
      }
    }

    throw error
  }

  // Cache helpers
  private static async getCachedPlaidData(): Promise<any> {
    // Implementation would fetch from IndexedDB
    return { accounts: [], cached: true }
  }

  private static async getCachedBiometricData(deviceType: string): Promise<any> {
    // Implementation would fetch from IndexedDB
    return { cached: true, deviceType }
  }
}
